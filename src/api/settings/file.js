/**
 * ==============================================================================
 * 下载选项模块: 文件相关设置 (File Settings)
 * ==============================================================================
 * 对应 aria2-next -h#file 选项列表 (共 9 项)
 * ==============================================================================
 */

export const fileOptions = [
  {
    "key": "allow-overwrite",
    "nameKey": "allow-overwrite.name",
    "descriptionKey": "allow-overwrite.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "auto-file-renaming",
    "nameKey": "auto-file-renaming.name",
    "descriptionKey": "auto-file-renaming.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
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
  },
  {
    "key": "file-allocation",
    "nameKey": "file-allocation.name",
    "descriptionKey": "file-allocation.description",
    "type": "option",
    "defaultValue": "none",
    "options": [
      "none",
      "prealloc",
      "trunc",
      "falloc"
    ],
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "remove-control-file",
    "nameKey": "remove-control-file.name",
    "descriptionKey": "remove-control-file.description",
    "type": "boolean",
    "defaultValue": "false",
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
    "key": "save-not-found",
    "nameKey": "save-not-found.name",
    "descriptionKey": "save-not-found.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "index-out",
    "nameKey": "index-out.name",
    "descriptionKey": "index-out.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default fileOptions;
