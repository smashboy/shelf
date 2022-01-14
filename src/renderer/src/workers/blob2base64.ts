// @ts-ignore
onmessage = (event) => {
  const { blob } = event.data as { blob: Blob };

  const reader = new FileReader();

  reader.readAsDataURL(blob);

  reader.onloadend = function () {
    const base64data = reader.result;
    postMessage(base64data);
  };

  reader.onerror = (error) => {
    throw new Error("Process blob web worker error");
  };
};
