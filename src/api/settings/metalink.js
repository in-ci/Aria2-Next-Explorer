/**
 * ==============================================================================
 * 下载选项模块: Metalink 设置 (Metalink Settings)
 * ==============================================================================
 * 对应 aria2-next -h#metalink 选项列表 (共 2 项)
 * ==============================================================================
 */

export const metalinkOptions = [
  {
    "key": "metalink-file",
    "nameKey": "metalink-file.name",
    "descriptionKey": "metalink-file.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "follow-metalink",
    "nameKey": "follow-metalink.name",
    "descriptionKey": "follow-metalink.description",
    "type": "option",
    "defaultValue": "true",
    "options": [
      "true",
      "false",
      "mem"
    ],
    "suffix": null,
    "required": true,
    "readonly": false
  }
];

export default metalinkOptions;
