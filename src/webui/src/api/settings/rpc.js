/**
 * ==============================================================================
 * 下载选项模块: RPC 服务设置 (RPC Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const rpcOptions = [
  {
    "key": "enable-rpc",
    "nameKey": "enable-rpc.name",
    "descriptionKey": "enable-rpc.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "rpc-listen-port",
    "nameKey": "rpc-listen-port.name",
    "descriptionKey": "rpc-listen-port.description",
    "type": "integer",
    "defaultValue": "6800",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "rpc-listen-all",
    "nameKey": "rpc-listen-all.name",
    "descriptionKey": "rpc-listen-all.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "rpc-allow-origin-all",
    "nameKey": "rpc-allow-origin-all.name",
    "descriptionKey": "rpc-allow-origin-all.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "rpc-secret",
    "nameKey": "rpc-secret.name",
    "descriptionKey": "rpc-secret.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "rpc-max-request-size",
    "nameKey": "rpc-max-request-size.name",
    "descriptionKey": "rpc-max-request-size.description",
    "type": "string",
    "defaultValue": "2M",
    "options": null,
    "suffix": "Bytes",
    "required": false,
    "readonly": true
  },
  {
    "key": "rpc-save-upload-metadata",
    "nameKey": "rpc-save-upload-metadata.name",
    "descriptionKey": "rpc-save-upload-metadata.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "pause",
    "nameKey": "pause.name",
    "descriptionKey": "pause.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default rpcOptions;
