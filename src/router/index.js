/**
 * ==============================================================================
 * 高性能极简 Hash 路由解析器
 * ==============================================================================
 * 兼容原有 AriaNg 的 hash 格式 (如 #!/downloading, #!/task/detail/:gid?tab=filelist)。
 * 零冗余依赖，响应迅速。
 * ==============================================================================
 */

import { ref } from "vue";

export const currentRoute = ref(parseHash(window.location.hash));

function getDefaultPage() {
  try {
    const saved = localStorage.getItem("AriaNg.Options");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.defaultTaskPage) return parsed.defaultTaskPage;
    }
  } catch (e) {}
  return "downloading";
}

function parseHash(hashStr) {
  const defaultPage = getDefaultPage();
  let hash = hashStr || `#!/${defaultPage}`;
  if (hash === "#" || hash === "#!" || hash === "#!/") hash = `#!/${defaultPage}`;
  if (hash.startsWith("#!")) hash = hash.substring(2);
  else if (hash.startsWith("#")) hash = hash.substring(1);

  const [pathPart, queryPart] = hash.split("?");
  const query = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [k, v] of searchParams.entries()) {
      query[k] = v;
    }
  }

  // 匹配特定视图
  if (pathPart === "/all" || pathPart === "/downloading" || pathPart === "/waiting" || pathPart === "/stopped") {
    return {
      name: "task-list",
      filter: pathPart.replace("/", ""),
      path: pathPart,
      query,
      params: {},
    };
  }

  if (pathPart === "/new") {
    return { name: "new-task", path: pathPart, query, params: {} };
  }

  if (pathPart.startsWith("/task/detail/")) {
    const gid = pathPart.replace("/task/detail/", "");
    return { name: "task-detail", path: pathPart, query, params: { gid } };
  }

  if (pathPart === "/status") {
    return { name: "status", path: pathPart, query, params: {} };
  }

  if (pathPart.startsWith("/settings/aria2")) {
    const category = pathPart.replace("/settings/aria2/", "").replace("/settings/aria2", "basic") || "basic";
    return { name: "settings-aria2", path: pathPart, query, params: { category } };
  }

  if (pathPart.startsWith("/settings/ariang")) {
    return { name: "settings-ariang", path: pathPart, query, params: {} };
  }

  // 默认 fallback
  return {
    name: "task-list",
    filter: defaultPage,
    path: `/${defaultPage}`,
    query,
    params: {},
  };
}

window.addEventListener("hashchange", () => {
  currentRoute.value = parseHash(window.location.hash);
});

export function navigate(path) {
  window.location.hash = `#${path.startsWith("!") ? path : "!" + path}`;
}
