import { AuthorizationRequest } from "@openid/appauth/built/authorization_request";
import {
  AuthorizationNotifier,
  AuthorizationRequestHandler,
  AuthorizationRequestResponse,
  BUILT_IN_PARAMETERS,
} from "@openid/appauth/built/authorization_request_handler";
import { AuthorizationResponse } from "@openid/appauth/built/authorization_response";
import { AuthorizationServiceConfiguration } from "@openid/appauth/built/authorization_service_configuration";
import { NodeCrypto } from "@openid/appauth/built/node_support/";
import { NodeBasedHandler } from "@openid/appauth/built/node_support/node_request_handler";
import { NodeRequestor } from "@openid/appauth/built/node_support/node_requestor";
import {
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  TokenRequest,
} from "@openid/appauth/built/token_request";
import {
  BaseTokenRequestHandler,
  TokenRequestHandler,
} from "@openid/appauth/built/token_request_handler";
import { TokenError, TokenResponse } from "@openid/appauth/built/token_response";
import EventEmitter from "events";

import { StringMap } from "@openid/appauth/built/types";

export class AuthStateEmitter extends EventEmitter {
  static ON_TOKEN_RESPONSE = "on_token_response";
}

/* the Node.js based HTTP client. */
const requestor = new NodeRequestor();

/* an example open id connect provider */
const openIdConnectUrl = "https://steamcommunity.com/openid";

/* example client configuration */
const clientId = "511828570984-7nmej36h9j2tebiqmpqh835naet4vci4.apps.googleusercontent.com";
const redirectUri = "http://127.0.0.1:8000";
const scope = "openid";

export class AuthFlow {
  private notifier: AuthorizationNotifier;
  private authorizationHandler: AuthorizationRequestHandler;
  private tokenHandler: TokenRequestHandler;
  readonly authStateEmitter: AuthStateEmitter;

  // state
  private configuration: AuthorizationServiceConfiguration | undefined;

  private refreshToken: string | undefined;
  private accessTokenResponse: TokenResponse | undefined;

  constructor() {
    this.notifier = new AuthorizationNotifier();
    this.authStateEmitter = new AuthStateEmitter();
    this.authorizationHandler = new NodeBasedHandler();
    this.tokenHandler = new BaseTokenRequestHandler(requestor);
    // set notifier to deliver responses
    this.authorizationHandler.setAuthorizationNotifier(this.notifier);
    // set a listener to listen for authorization responses
    // make refresh and access token requests.
    this.notifier.setAuthorizationListener((request, response, error) => {
      if (response) {
        let codeVerifier: string | undefined;
        if (request.internal && request.internal.code_verifier) {
          codeVerifier = request.internal.code_verifier;
        }

        this.makeRefreshTokenRequest(response.code, codeVerifier)
          .then((result) => this.performWithFreshTokens())
          .then(() => {
            this.authStateEmitter.emit(AuthStateEmitter.ON_TOKEN_RESPONSE);
          });
      }
    });
  }

  fetchServiceConfiguration(): Promise<void> {
    return AuthorizationServiceConfiguration.fetchFromIssuer(openIdConnectUrl, requestor).then(
      (response) => {
        this.configuration = response;
      }
    );
  }

  makeAuthorizationRequest(username?: string) {
    if (!this.configuration) {
      return;
    }

    const extras: StringMap = { prompt: "consent", access_type: "offline" };
    if (username) {
      extras["login_hint"] = username;
    }

    // create a request
    const request = new AuthorizationRequest(
      {
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        state: undefined,
        extras: extras,
      },
      new NodeCrypto()
    );

    this.authorizationHandler.performAuthorizationRequest(this.configuration, request);
  }

  private makeRefreshTokenRequest(code: string, codeVerifier: string | undefined): Promise<void> {
    if (!this.configuration) {
      return Promise.resolve();
    }

    const extras: StringMap = {};

    if (codeVerifier) {
      extras.code_verifier = codeVerifier;
    }

    // use the code to make the token request.
    let request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: code,
      refresh_token: undefined,
      extras: extras,
    });

    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then((response) => {
        this.refreshToken = response.refreshToken;
        this.accessTokenResponse = response;
        return response;
      })
      .then(() => {});
  }

  loggedIn(): boolean {
    return !!this.accessTokenResponse && this.accessTokenResponse.isValid();
  }

  signOut() {
    // forget all cached token state
    this.accessTokenResponse = undefined;
  }

  performWithFreshTokens(): Promise<string> {
    if (!this.configuration) {
      return Promise.reject("Unknown service configuration");
    }
    if (!this.refreshToken) {
      return Promise.resolve("Missing refreshToken.");
    }
    if (this.accessTokenResponse && this.accessTokenResponse.isValid()) {
      // do nothing
      return Promise.resolve(this.accessTokenResponse.accessToken);
    }
    let request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      code: undefined,
      refresh_token: this.refreshToken,
      extras: undefined,
    });

    return this.tokenHandler.performTokenRequest(this.configuration, request).then((response) => {
      this.accessTokenResponse = response;
      return response.accessToken;
    });
  }
}

export default class SteamAuth {}
