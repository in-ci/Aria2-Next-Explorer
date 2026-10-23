/**
 * ==============================================================================
 * 下载选项模块: Metalink 设置 (Metalink Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const metalinkOptions = [
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
