/**
 * ==============================================================================
 * 下载选项模块: 基本设置 (Basic Settings)
 * ==============================================================================
 * 对应 aria2-next -h#basic 选项列表 (共 11 项)
 * ==============================================================================
 */

export const basicOptions = [
  {
    "key": "dir",
    "nameKey": "dir.name",
    "descriptionKey": "dir.description",
    "type": "string",
    "defaultValue": ".",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "out",
    "nameKey": "out.name",
    "descriptionKey": "out.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "input-file",
    "nameKey": "input-file.name",
    "descriptionKey": "input-file.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "max-concurrent-downloads",
    "nameKey": "max-concurrent-downloads.name",
    "descriptionKey": "max-concurrent-downloads.description",
    "type": "integer",
    "defaultValue": "5",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "continue",
    "nameKey": "continue.name",
    "descriptionKey": "continue.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "check-integrity",
    "nameKey": "check-integrity.name",
    "descriptionKey": "check-integrity.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "log",
    "nameKey": "log.name",
    "descriptionKey": "log.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "quiet",
    "nameKey": "quiet.name",
    "descriptionKey": "quiet.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "daemon",
    "nameKey": "daemon.name",
    "descriptionKey": "daemon.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "conf-path",
    "nameKey": "conf-path.name",
    "descriptionKey": "conf-path.description",
    "type": "string",
    "defaultValue": "$HOME/.aria2/aria2.conf",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "no-conf",
    "nameKey": "no-conf.name",
    "descriptionKey": "no-conf.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  }
];

export default basicOptions;
