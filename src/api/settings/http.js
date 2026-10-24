/**
 * ==============================================================================
 * 下载选项模块: HTTP/HTTPS/代理/SFTP设置 (HTTP Settings)
 * ==============================================================================
 * 对应 aria2-next -h#http 选项列表 (共 49 项)
 * ==============================================================================
 */

export const httpOptions = [
  {
    "key": "split",
    "nameKey": "split.name",
    "descriptionKey": "split.description",
    "type": "integer",
    "defaultValue": "16",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "max-connection-per-server",
    "nameKey": "max-connection-per-server.name",
    "descriptionKey": "max-connection-per-server.description",
    "type": "integer",
    "defaultValue": "16",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "min-split-size",
    "nameKey": "min-split-size.name",
    "descriptionKey": "min-split-size.description",
    "type": "string",
    "defaultValue": "1M",
    "options": null,
    "suffix": "Bytes",
    "required": true,
    "readonly": false
  },
  {
    "key": "timeout",
    "nameKey": "timeout.name",
    "descriptionKey": "timeout.description",
    "type": "integer",
    "defaultValue": "60",
    "options": null,
    "suffix": "Seconds",
    "required": true,
    "readonly": false
  },
  {
    "key": "connect-timeout",
    "nameKey": "connect-timeout.name",
    "descriptionKey": "connect-timeout.description",
    "type": "integer",
    "defaultValue": "60",
    "options": null,
    "suffix": "Seconds",
    "required": true,
    "readonly": false
  },
  {
    "key": "max-tries",
    "nameKey": "max-tries.name",
    "descriptionKey": "max-tries.description",
    "type": "integer",
    "defaultValue": "5",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "retry-wait",
    "nameKey": "retry-wait.name",
    "descriptionKey": "retry-wait.description",
    "type": "integer",
    "defaultValue": "0",
    "options": null,
    "suffix": "Seconds",
    "required": true,
    "readonly": false
  },
  {
    "key": "lowest-speed-limit",
    "nameKey": "lowest-speed-limit.name",
    "descriptionKey": "lowest-speed-limit.description",
    "type": "string",
    "defaultValue": "0",
    "options": null,
    "suffix": "Bytes",
    "required": true,
    "readonly": false
  },
  {
    "key": "max-download-limit",
    "nameKey": "max-download-limit.name",
    "descriptionKey": "max-download-limit.description",
    "type": "string",
    "defaultValue": "0",
    "options": null,
    "suffix": "Bytes",
    "required": true,
    "readonly": false
  },
  {
    "key": "max-overall-download-limit",
    "nameKey": "max-overall-download-limit.name",
    "descriptionKey": "max-overall-download-limit.description",
    "type": "string",
    "defaultValue": "0",
    "options": null,
    "suffix": "Bytes",
    "required": true,
    "readonly": false
  },
  {
    "key": "user-agent",
    "nameKey": "user-agent.name",
    "descriptionKey": "user-agent.description",
    "type": "string",
    "defaultValue": "aria2-next",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "referer",
    "nameKey": "referer.name",
    "descriptionKey": "referer.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "header",
    "nameKey": "header.name",
    "descriptionKey": "header.description",
    "type": "text",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "http-user",
    "nameKey": "http-user.name",
    "descriptionKey": "http-user.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "http-passwd",
    "nameKey": "http-passwd.name",
    "descriptionKey": "http-passwd.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "http-no-cache",
    "nameKey": "http-no-cache.name",
    "descriptionKey": "http-no-cache.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "http-accept-gzip",
    "nameKey": "http-accept-gzip.name",
    "descriptionKey": "http-accept-gzip.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "enable-http-keep-alive",
    "nameKey": "enable-http-keep-alive.name",
    "descriptionKey": "enable-http-keep-alive.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "load-cookies",
    "nameKey": "load-cookies.name",
    "descriptionKey": "load-cookies.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "save-cookies",
    "nameKey": "save-cookies.name",
    "descriptionKey": "save-cookies.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "check-certificate",
    "nameKey": "check-certificate.name",
    "descriptionKey": "check-certificate.description",
    "type": "boolean",
    "defaultValue": "true",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "ca-certificate",
    "nameKey": "ca-certificate.name",
    "descriptionKey": "ca-certificate.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "certificate",
    "nameKey": "certificate.name",
    "descriptionKey": "certificate.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "private-key",
    "nameKey": "private-key.name",
    "descriptionKey": "private-key.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "min-tls-version",
    "nameKey": "min-tls-version.name",
    "descriptionKey": "min-tls-version.description",
    "type": "option",
    "defaultValue": "TLSv1.2",
    "options": [
      "SSLv3",
      "TLSv1",
      "TLSv1.1",
      "TLSv1.2"
    ],
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "all-proxy",
    "nameKey": "all-proxy.name",
    "descriptionKey": "all-proxy.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "all-proxy-user",
    "nameKey": "all-proxy-user.name",
    "descriptionKey": "all-proxy-user.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "all-proxy-passwd",
    "nameKey": "all-proxy-passwd.name",
    "descriptionKey": "all-proxy-passwd.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "http-proxy",
    "nameKey": "http-proxy.name",
    "descriptionKey": "http-proxy.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "http-proxy-user",
    "nameKey": "http-proxy-user.name",
    "descriptionKey": "http-proxy-user.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "http-proxy-passwd",
    "nameKey": "http-proxy-passwd.name",
    "descriptionKey": "http-proxy-passwd.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "https-proxy",
    "nameKey": "https-proxy.name",
    "descriptionKey": "https-proxy.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "https-proxy-user",
    "nameKey": "https-proxy-user.name",
    "descriptionKey": "https-proxy-user.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "https-proxy-passwd",
    "nameKey": "https-proxy-passwd.name",
    "descriptionKey": "https-proxy-passwd.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "no-proxy",
    "nameKey": "no-proxy.name",
    "descriptionKey": "no-proxy.description",
    "type": "text",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "dns-over-https",
    "nameKey": "dns-over-https.name",
    "descriptionKey": "dns-over-https.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "interface",
    "nameKey": "interface.name",
    "descriptionKey": "interface.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "disable-ipv6",
    "nameKey": "disable-ipv6.name",
    "descriptionKey": "disable-ipv6.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "netrc-path",
    "nameKey": "netrc-path.name",
    "descriptionKey": "netrc-path.description",
    "type": "string",
    "defaultValue": "$(HOME)/.netrc",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": true
  },
  {
    "key": "no-netrc",
    "nameKey": "no-netrc.name",
    "descriptionKey": "no-netrc.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "sftp-user",
    "nameKey": "sftp-user.name",
    "descriptionKey": "sftp-user.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "sftp-passwd",
    "nameKey": "sftp-passwd.name",
    "descriptionKey": "sftp-passwd.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "ssh-host-key-sha256",
    "nameKey": "ssh-host-key-sha256.name",
    "descriptionKey": "ssh-host-key-sha256.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": false,
    "readonly": false
  },
  {
    "key": "remote-time",
    "nameKey": "remote-time.name",
    "descriptionKey": "remote-time.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "checksum",
    "nameKey": "checksum.name",
    "descriptionKey": "checksum.description",
    "type": "string",
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  },
  {
    "key": "max-file-not-found",
    "nameKey": "max-file-not-found.name",
    "descriptionKey": "max-file-not-found.description",
    "type": "integer",
    "defaultValue": "0",
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
    "key": "dry-run",
    "nameKey": "dry-run.name",
    "descriptionKey": "dry-run.description",
    "type": "boolean",
    "defaultValue": "false",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  }
];

export default httpOptions;
