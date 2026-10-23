/**
 * ==============================================================================
 * 下载选项模块: 媒体流设置 (Media Stream Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const mediaOptions = [
  {
    "key": "media",
    "nameKey": "media.name",
    "descriptionKey": "media.description",
    "type": "option",
    "defaultValue": "auto",
    "options": [
      "auto",
      "file",
      "hls",
      "dash",
      "collection"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-format",
    "nameKey": "media-format.name",
    "descriptionKey": "media-format.description",
    "type": "option",
    "defaultValue": "mp4",
    "options": [
      "mp4",
      "mkv",
      "vtt"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-video",
    "nameKey": "media-video.name",
    "descriptionKey": "media-video.description",
    "type": "string",
    "defaultValue": "best",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-audio",
    "nameKey": "media-audio.name",
    "descriptionKey": "media-audio.description",
    "type": "string",
    "defaultValue": "best",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-subtitles",
    "nameKey": "media-subtitles.name",
    "descriptionKey": "media-subtitles.description",
    "type": "string",
    "defaultValue": "all",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-pause-after-probe",
    "nameKey": "media-pause-after-probe.name",
    "descriptionKey": "media-pause-after-probe.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-record-time",
    "nameKey": "media-record-time.name",
    "descriptionKey": "media-record-time.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-start-time",
    "nameKey": "media-start-time.name",
    "descriptionKey": "media-start-time.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-end-time",
    "nameKey": "media-end-time.name",
    "descriptionKey": "media-end-time.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-request-contexts",
    "nameKey": "media-request-contexts.name",
    "descriptionKey": "media-request-contexts.description",
    "type": "integer",
    "defaultValue": "4",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "media-input",
    "nameKey": "media-input.name",
    "descriptionKey": "media-input.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default mediaOptions;
