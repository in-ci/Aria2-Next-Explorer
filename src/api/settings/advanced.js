/**
 * ==============================================================================
 * 下载选项模块: 高级设置 (Advanced Settings)
 * ==============================================================================
 * 对应 aria2-next -h#advanced 选项列表 (共 22 项)
 * ==============================================================================
 */

export const advancedOptions = [
  {
    "key": "state-dir",
    "nameKey": "state-dir.name",
    "descriptionKey": "state-dir.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "save-session",
    "nameKey": "save-session.name",
    "descriptionKey": "save-session.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "save-session-interval",
    "nameKey": "save-session-interval.name",
    "descriptionKey": "save-session-interval.description",
    "type": "integer",
    "defaultValue": "0",
    "options": null,
    "suffix": "Seconds",
    "required": false,
    "readonly": true
  },
  {
    "key": "state-save-interval",
    "nameKey": "state-save-interval.name",
    "descriptionKey": "state-save-interval.description",
    "type": "integer",
    "defaultValue": "10",
    "options": null,
    "suffix": "Seconds",
    "required": false,
    "readonly": false
  },
  {
    "key": "max-download-result",
    "nameKey": "max-download-result.name",
    "descriptionKey": "max-download-result.description",
    "type": "integer",
    "defaultValue": "1000",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "keep-unfinished-download-result",
    "nameKey": "keep-unfinished-download-result.name",
    "descriptionKey": "keep-unfinished-download-result.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "stop",
    "nameKey": "stop.name",
    "descriptionKey": "stop.description",
    "type": "integer",
    "defaultValue": "0",
    "options": null,
    "suffix": "Seconds",
    "required": false,
    "readonly": true
  },
  {
    "key": "stop-with-process",
    "nameKey": "stop-with-process.name",
    "descriptionKey": "stop-with-process.description",
    "type": "integer",
    "defaultValue": "0",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "summary-interval",
    "nameKey": "summary-interval.name",
    "descriptionKey": "summary-interval.description",
    "type": "integer",
    "defaultValue": "60",
    "options": null,
    "suffix": "Seconds",
    "required": false,
    "readonly": true
  },
  {
    "key": "show-console-readout",
    "nameKey": "show-console-readout.name",
    "descriptionKey": "show-console-readout.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "enable-color",
    "nameKey": "enable-color.name",
    "descriptionKey": "enable-color.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "download-result",
    "nameKey": "download-result.name",
    "descriptionKey": "download-result.description",
    "type": "option",
    "defaultValue": "default",
    "options": [
      "default",
      "full",
      "hide"
    ],
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "log-level",
    "nameKey": "log-level.name",
    "descriptionKey": "log-level.description",
    "type": "option",
    "defaultValue": "debug",
    "options": [
      "debug",
      "info",
      "notice",
      "warn",
      "error"
    ],
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "console-log-level",
    "nameKey": "console-log-level.name",
    "descriptionKey": "console-log-level.description",
    "type": "option",
    "defaultValue": "notice",
    "options": [
      "debug",
      "info",
      "notice",
      "warn",
      "error"
    ],
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "log-max-size",
    "nameKey": "log-max-size.name",
    "descriptionKey": "log-max-size.description",
    "type": "string",
    "defaultValue": "10M",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "log-max-files",
    "nameKey": "log-max-files.name",
    "descriptionKey": "log-max-files.description",
    "type": "integer",
    "defaultValue": "4",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "on-download-start",
    "nameKey": "on-download-start.name",
    "descriptionKey": "on-download-start.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "on-download-pause",
    "nameKey": "on-download-pause.name",
    "descriptionKey": "on-download-pause.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "on-download-stop",
    "nameKey": "on-download-stop.name",
    "descriptionKey": "on-download-stop.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "on-download-complete",
    "nameKey": "on-download-complete.name",
    "descriptionKey": "on-download-complete.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "on-download-error",
    "nameKey": "on-download-error.name",
    "descriptionKey": "on-download-error.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "on-bt-download-complete",
    "nameKey": "on-bt-download-complete.name",
    "descriptionKey": "on-bt-download-complete.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default advancedOptions;
