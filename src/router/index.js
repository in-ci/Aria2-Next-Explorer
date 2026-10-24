/**
 * ==============================================================================
 * 高性能极简 Hash 路由解析器
 * ==============================================================================
 * 兼容原有 AriaNg 的 hash 格式 (如 #!/downloading, #!/new?url=..., #!/new/:url, #!/task/detail/:gid)。
 * 支持同时解析 Hash Query 与页面 Search Query 中的下载拦截参数。
 * ==============================================================================
 */

import { ref } from "vue";

export const currentRoute = ref(parseHash(window.location.hash));

/**
 * 获取用户配置的默认任务列表页面
 * @returns {string} 默认页面标识 (downloading, waiting, stopped, all)
 */
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

/**
 * 解析当前页面的 Hash 路径与查询参数对象
 * @param {string} hashStr 原始 window.location.hash 字符串
 * @returns {object} 解析后的路由对象
 */
function parseHash(hashStr) {
  const defaultPage = getDefaultPage();
  let hash = hashStr || `#!/${defaultPage}`;
  if (hash === "#" || hash === "#!" || hash === "#!/") hash = `#!/${defaultPage}`;
  if (hash.startsWith("#!")) hash = hash.substring(2);
  else if (hash.startsWith("#")) hash = hash.substring(1);

  // 分离路径与查询字符串（使用 indexOf 避免参数值内部含问号导致被误截断）
  const qIndex = hash.indexOf("?");
  let pathPart = qIndex >= 0 ? hash.substring(0, qIndex) : hash;
  const queryPart = qIndex >= 0 ? hash.substring(qIndex + 1) : "";
  const query = {};

  // 1. 优先解析 Hash Query 中的参数（拦截下载时的主要传参通道）
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    for (const [k, v] of searchParams.entries()) {
      query[k] = v;
    }
  }

  // 2. 兼容解析 window.location.search 查询参数
  if (typeof window !== "undefined" && window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    for (const [k, v] of searchParams.entries()) {
      if (!query[k]) {
        query[k] = v;
      }
    }
  }

  // 3. 匹配任务列表页面
  if (pathPart === "/all" || pathPart === "/downloading" || pathPart === "/waiting" || pathPart === "/stopped") {
    return {
      name: "task-list",
      filter: pathPart.replace("/", ""),
      path: pathPart,
      query,
      params: {},
    };
  }

  // 4. 匹配新建任务页面（兼容 #!/new 与 #!/new/:url 格式）
  if (pathPart === "/new" || pathPart.startsWith("/new/")) {
    if (pathPart.startsWith("/new/")) {
      const inlineUrl = pathPart.replace("/new/", "");
      if (inlineUrl && !query.url) {
        query.url = inlineUrl;
      }
    }
    return { name: "new-task", path: "/new", query, params: {} };
  }

  // 5. 匹配任务详情页面
  if (pathPart.startsWith("/task/detail/")) {
    const gid = pathPart.replace("/task/detail/", "");
    return { name: "task-detail", path: pathPart, query, params: { gid } };
  }

  // 6. 匹配服务端状态页面
  if (pathPart === "/status") {
    return { name: "status", path: pathPart, query, params: {} };
  }

  // 7. 匹配 Aria2 各类下载设置页面
  if (pathPart.startsWith("/settings/aria2")) {
    const category = pathPart.replace("/settings/aria2/", "").replace("/settings/aria2", "basic") || "basic";
    return { name: "settings-aria2", path: pathPart, query, params: { category } };
  }

  // 8. 匹配 AriaNg WebUI 常规设置页面
  if (pathPart.startsWith("/settings/ariang")) {
    return { name: "settings-ariang", path: pathPart, query, params: {} };
  }

  // 9. 默认回退页面
  return {
    name: "task-list",
    filter: defaultPage,
    path: `/${defaultPage}`,
    query,
    params: {},
  };
}

// 监听浏览器前进、后退及 hash 变更
window.addEventListener("hashchange", () => {
  currentRoute.value = parseHash(window.location.hash);
});

/**
 * 路由跳转工具函数
 * @param {string} path 目标相对路径（如 '/downloading', '/new'）
 */
export function navigate(path) {
  window.location.hash = `#${path.startsWith("!") ? path : "!" + path}`;
}
