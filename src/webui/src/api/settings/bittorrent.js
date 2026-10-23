/**
 * ==============================================================================
 * 下载选项模块: BitTorrent 设置 (BitTorrent Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const bittorrentOptions = [
  {
    "key": "enable-dht",
    "nameKey": "enable-dht.name",
    "descriptionKey": "enable-dht.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "enable-peer-exchange",
    "nameKey": "enable-peer-exchange.name",
    "descriptionKey": "enable-peer-exchange.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "bt-enable-lpd",
    "nameKey": "bt-enable-lpd.name",
    "descriptionKey": "bt-enable-lpd.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "bt-port-mapping",
    "nameKey": "bt-port-mapping.name",
    "descriptionKey": "bt-port-mapping.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-encryption",
    "nameKey": "bt-encryption.name",
    "descriptionKey": "bt-encryption.description",
    "type": "option",
    "defaultValue": "preferred",
    "options": [
      "preferred",
      "required",
      "disabled"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-transport",
    "nameKey": "bt-transport.name",
    "descriptionKey": "bt-transport.description",
    "type": "option",
    "defaultValue": "both",
    "options": [
      "both",
      "tcp",
      "utp"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-tracker",
    "nameKey": "bt-tracker.name",
    "descriptionKey": "bt-tracker.description",
    "type": "text",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-exclude-tracker",
    "nameKey": "bt-exclude-tracker.name",
    "descriptionKey": "bt-exclude-tracker.description",
    "type": "text",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-max-peers",
    "nameKey": "bt-max-peers.name",
    "descriptionKey": "bt-max-peers.description",
    "type": "integer",
    "defaultValue": "55",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "bt-max-connections",
    "nameKey": "bt-max-connections.name",
    "descriptionKey": "bt-max-connections.description",
    "type": "integer",
    "defaultValue": "55",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-max-uploads",
    "nameKey": "bt-max-uploads.name",
    "descriptionKey": "bt-max-uploads.description",
    "type": "integer",
    "defaultValue": "0",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-max-uploads-per-torrent",
    "nameKey": "bt-max-uploads-per-torrent.name",
    "descriptionKey": "bt-max-uploads-per-torrent.description",
    "type": "integer",
    "defaultValue": "4",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "max-upload-limit",
    "nameKey": "max-upload-limit.name",
    "descriptionKey": "max-upload-limit.description",
    "type": "string",
    "defaultValue": "0",
    "options": null,
    "suffix": "Bytes",
    "required": true,
    "readonly": false
  },
  {
    "key": "max-overall-upload-limit",
    "nameKey": "max-overall-upload-limit.name",
    "descriptionKey": "max-overall-upload-limit.description",
    "type": "string",
    "defaultValue": "0",
    "options": null,
    "suffix": "Bytes",
    "required": true,
    "readonly": false
  },
  {
    "key": "seed-ratio",
    "nameKey": "seed-ratio.name",
    "descriptionKey": "seed-ratio.description",
    "type": "float",
    "defaultValue": "1.0",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "seed-time",
    "nameKey": "seed-time.name",
    "descriptionKey": "seed-time.description",
    "type": "float",
    "defaultValue": "",
    "options": null,
    "suffix": "Minutes",
    "required": true,
    "readonly": false
  },
  {
    "key": "bt-seed-unverified",
    "nameKey": "bt-seed-unverified.name",
    "descriptionKey": "bt-seed-unverified.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "bt-super-seeding",
    "nameKey": "bt-super-seeding.name",
    "descriptionKey": "bt-super-seeding.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-first-last-piece-first",
    "nameKey": "bt-first-last-piece-first.name",
    "descriptionKey": "bt-first-last-piece-first.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-file-priority",
    "nameKey": "bt-file-priority.name",
    "descriptionKey": "bt-file-priority.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "force-sequential",
    "nameKey": "force-sequential.name",
    "descriptionKey": "force-sequential.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "detach-share-only",
    "nameKey": "detach-share-only.name",
    "descriptionKey": "detach-share-only.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "listen-port",
    "nameKey": "listen-port.name",
    "descriptionKey": "listen-port.description",
    "type": "integer",
    "defaultValue": "6881-6999",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "follow-torrent",
    "nameKey": "follow-torrent.name",
    "descriptionKey": "follow-torrent.description",
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
  },
  {
    "key": "pause-metadata",
    "nameKey": "pause-metadata.name",
    "descriptionKey": "pause-metadata.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "bt-external-ip",
    "nameKey": "bt-external-ip.name",
    "descriptionKey": "bt-external-ip.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-external-port",
    "nameKey": "bt-external-port.name",
    "descriptionKey": "bt-external-port.description",
    "type": "integer",
    "defaultValue": "0",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-interface",
    "nameKey": "bt-interface.name",
    "descriptionKey": "bt-interface.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-proxy",
    "nameKey": "bt-proxy.name",
    "descriptionKey": "bt-proxy.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-anonymous-mode",
    "nameKey": "bt-anonymous-mode.name",
    "descriptionKey": "bt-anonymous-mode.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-user-agent",
    "nameKey": "bt-user-agent.name",
    "descriptionKey": "bt-user-agent.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-peer-id-prefix",
    "nameKey": "bt-peer-id-prefix.name",
    "descriptionKey": "bt-peer-id-prefix.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-peer-blocklist",
    "nameKey": "bt-peer-blocklist.name",
    "descriptionKey": "bt-peer-blocklist.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-blocklist-scope",
    "nameKey": "bt-blocklist-scope.name",
    "descriptionKey": "bt-blocklist-scope.description",
    "type": "option",
    "defaultValue": "all",
    "options": [
      "all",
      "peers",
      "trackers"
    ],
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-rate-limit-overhead",
    "nameKey": "bt-rate-limit-overhead.name",
    "descriptionKey": "bt-rate-limit-overhead.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "bt-dht-bootstrap-nodes",
    "nameKey": "bt-dht-bootstrap-nodes.name",
    "descriptionKey": "bt-dht-bootstrap-nodes.description",
    "type": "text",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  }
];

export default bittorrentOptions;
