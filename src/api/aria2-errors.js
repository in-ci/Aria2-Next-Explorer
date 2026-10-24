/**
 * ==============================================================================
 * Aria2 错误码定义字典
 * ==============================================================================
 */

export const aria2Errors = {
  1: { descriptionKey: "unknown" },
  2: { descriptionKey: "operation.timeout" },
  3: { descriptionKey: "resource.notfound" },
  4: { descriptionKey: "resource.notfound.max-file-not-found" },
  5: { descriptionKey: "download.aborted.lowest-speed-limit" },
  6: { descriptionKey: "network.problem" },
  7: { descriptionKey: "unfinished.download" },
  8: { descriptionKey: "resume.notsupported" },
  9: { descriptionKey: "space.notenough" },
  10: { descriptionKey: "piece.length.different" },
  11: { descriptionKey: "download.sametime" },
  12: { descriptionKey: "download.torrent.sametime" },
  13: { descriptionKey: "file.exists" },
  14: { descriptionKey: "file.rename.failed" },
  15: { descriptionKey: "file.open.failed" },
  16: { descriptionKey: "file.create.failed" },
  17: { descriptionKey: "io.error" },
  18: { descriptionKey: "directory.create.failed" },
  19: { descriptionKey: "name.resolution.failed" },
  20: { descriptionKey: "metalink.file.parse.failed" },
  21: { descriptionKey: "ftp.command.failed" },
  22: { descriptionKey: "http.response.header.bad" },
  23: { descriptionKey: "redirects.toomany" },
  24: { descriptionKey: "http.authorization.failed" },
  25: { descriptionKey: "bencoded.file.parse.failed" },
  26: { descriptionKey: "torrent.file.corrupted" },
  27: { descriptionKey: "magnet.uri.bad" },
  28: { descriptionKey: "option.bad" },
  29: { descriptionKey: "server.overload" },
  30: { descriptionKey: "rpc.request.parse.failed" },
  31: { descriptionKey: "unknown" },
  32: { descriptionKey: "checksum.failed" }
};

export function getErrorDescription(errorCode) {
  if (!errorCode || errorCode === "0") return "";
  const err = aria2Errors[errorCode];
  return err ? err.descriptionKey : "unknown";
}
