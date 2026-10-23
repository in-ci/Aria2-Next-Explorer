/**
 * ==============================================================================
 * 下载选项模块: SFTP/SSH 设置 (SFTP Settings)
 * ==============================================================================
 * 说明: 如需在该分类下新增或修改选项，可直接在此处编辑/增加配置对象。
 * ==============================================================================
 */

export const sftpOptions = [
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
    "defaultValue": "",
    "options": null,
    "suffix": null,
    "required": true,
    "readonly": false
  }
];

export default sftpOptions;
