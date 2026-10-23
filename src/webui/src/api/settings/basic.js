/**
 * ==============================================================================
 * 下载选项模块: 基本设置 (Basic Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const basicOptions = [
  {
    "key": "dir",
    "nameKey": "dir.name",
    "descriptionKey": "dir.description",
    "type": "string",
    "defaultValue": "",
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
    "key": "continue",
    "nameKey": "continue.name",
    "descriptionKey": "continue.description",
    "type": "boolean",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "force-save",
    "nameKey": "force-save.name",
    "descriptionKey": "force-save.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "filename-hint",
    "nameKey": "filename-hint.name",
    "descriptionKey": "filename-hint.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "filename-hint-source",
    "nameKey": "filename-hint-source.name",
    "descriptionKey": "filename-hint-source.description",
    "type": "option",
    "defaultValue": "suggested",
    "options": [
      "suggested",
      "browser",
      "title"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "incomplete-suffix",
    "nameKey": "incomplete-suffix.name",
    "descriptionKey": "incomplete-suffix.description",
    "type": "string",
    "defaultValue": ".part",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "auto-file-renaming-style",
    "nameKey": "auto-file-renaming-style.name",
    "descriptionKey": "auto-file-renaming-style.description",
    "type": "option",
    "defaultValue": "dot",
    "options": [
      "dot",
      "parentheses"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default basicOptions;
