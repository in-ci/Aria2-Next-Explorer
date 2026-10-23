/**
 * ==============================================================================
 * 下载选项模块: ED2K (电驴) 设置 (ED2K Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const ed2kOptions = [
  {
    "key": "ed2k-server",
    "nameKey": "ed2k-server.name",
    "descriptionKey": "ed2k-server.description",
    "type": "text",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-server-list",
    "nameKey": "ed2k-server-list.name",
    "descriptionKey": "ed2k-server-list.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-node-list",
    "nameKey": "ed2k-node-list.name",
    "descriptionKey": "ed2k-node-list.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-listen-port",
    "nameKey": "ed2k-listen-port.name",
    "descriptionKey": "ed2k-listen-port.description",
    "type": "integer",
    "defaultValue": "4662",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-udp-listen-port",
    "nameKey": "ed2k-udp-listen-port.name",
    "descriptionKey": "ed2k-udp-listen-port.description",
    "type": "integer",
    "defaultValue": "4672",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-port-mapping",
    "nameKey": "ed2k-port-mapping.name",
    "descriptionKey": "ed2k-port-mapping.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-upload-slots",
    "nameKey": "ed2k-upload-slots.name",
    "descriptionKey": "ed2k-upload-slots.description",
    "type": "integer",
    "defaultValue": "4",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-max-connections",
    "nameKey": "ed2k-max-connections.name",
    "descriptionKey": "ed2k-max-connections.description",
    "type": "integer",
    "defaultValue": "100",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ed2k-preview-priority",
    "nameKey": "ed2k-preview-priority.name",
    "descriptionKey": "ed2k-preview-priority.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default ed2kOptions;
