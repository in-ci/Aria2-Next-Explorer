/**
 * ==============================================================================
 * Aria2 错误码定义字典
 * ==============================================================================
 */

export const aria2Errors = {
  1: { descriptionKey: "error.unknown" },
  2: { descriptionKey: "error.operation.timeout" },
  3: { descriptionKey: "error.resource.notfound" },
  4: { descriptionKey: "error.resource.notfound.max-file-not-found" },
  5: { descriptionKey: "error.download.aborted.lowest-speed-limit" },
  6: { descriptionKey: "error.network.problem" },
  7: { descriptionKey: "error.unfinished.download" },
  8: { descriptionKey: "error.resume.notsupported" },
  9: { descriptionKey: "error.not.enough.disk.space" },
  10: { descriptionKey: "error.piece.length.different" },
  11: { descriptionKey: "error.downloading.same.file" },
  12: { descriptionKey: "error.downloading.same.infohash" },
  13: { descriptionKey: "error.file.already.exists" },
  14: { descriptionKey: "error.renaming.failed" },
  15: { descriptionKey: "error.open.file.failed" },
  16: { descriptionKey: "error.create.file.failed" },
  17: { descriptionKey: "error.file.io.error" },
  18: { descriptionKey: "error.create.directory.failed" },
  19: { descriptionKey: "error.name.resolution.failed" },
  20: { descriptionKey: "error.parse.metalink.failed" },
  21: { descriptionKey: "error.ftp.command.failed" },
  22: { descriptionKey: "error.http.response.bad" },
  23: { descriptionKey: "error.too.many.redirects" },
  24: { descriptionKey: "error.http.authorization.failed" },
  25: { descriptionKey: "error.parse.bencoded.failed" },
  26: { descriptionKey: "error.torrent.corrupted" },
  27: { descriptionKey: "error.magnet.bad" },
  28: { descriptionKey: "error.bad.option" },
  29: { descriptionKey: "error.remote.server.error" },
  30: { descriptionKey: "error.parse.jsonrpc.failed" },
  32: { descriptionKey: "error.checksum.failed" }
};

export function getErrorDescription(errorCode) {
  if (!errorCode || errorCode === "0") return "";
  const err = aria2Errors[errorCode];
  return err ? err.descriptionKey : "error.unknown";
}
