/**
 * Popup 窗口尺寸缩放与自适应定位
 */
chrome?.tabs?.getZoomSettings?.((zoomSettings) => {
  const zoomFactor = zoomSettings?.defaultZoomFactor || 1;
  const element = document.getElementById("AriaNG");
  if (element && zoomFactor > 0 && zoomFactor !== 1) {
    const adjustedWidth = Math.floor(element.offsetWidth / zoomFactor);
    const adjustedHeight = Math.floor(element.offsetHeight / zoomFactor);
    element.style.width = adjustedWidth + "px";
    element.style.height = adjustedHeight + "px";
  }
  if (element && window.location.hash) {
    element.src += window.location.hash;
  }
});
