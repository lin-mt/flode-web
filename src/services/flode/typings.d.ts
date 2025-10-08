declare namespace API {
  type AddIteration = {
    /** 迭代名称 */
    name: string;
    /** 版本ID */
    versionId: string;
    /** 计划开始时间 */
    plannedStartTime?: string;
    /** 计划结束时间 */
    plannedEndTime?: string;
    /** 迭代描述 */
    description?: string;
  };

  type AddPermission = {
    /** 排序值 */
    ordinal?: number;
    /** 父ID */
    parentId?: string;
    /** 权限名称 */
    name: string;
    /** 权限类型 */
    type: "MENU" | "BUTTON" | "API";
    /** 前端路由 */
    route?: string;
    /** 权限值 */
    value?: string;
    /** 请求地址 */
    httpUrl?: string;
    /** 请求方法 */
    httpMethod?:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "PATCH"
      | "DELETE"
      | "OPTIONS";
    /** 权限描述 */
    description?: string;
  };

  type AddProject = {
    /** 项目名称 */
    name: string;
    /** 模板ID */
    templateId: string;
    /** 项目自动化 */
    automations?: ProjectAutomationDTO[];
    /** 项目组ID */
    projectGroupId: string;
    /** 项目成员ID */
    memberIds?: string[];
    /** 项目描述 */
    description?: string;
  };

  type AddProjectGroup = {
    /** 项目组名称 */
    name: string;
    /** 项目组描述 */
    description?: string;
  };

  type AddRepository = {
    /** 仓库名称 */
    name: string;
    /** 仓库类型 */
    type: "GITLAB" | "GITHUB";
    /** 构建工具 */
    buildTool: "MAVEN" | "GRADLE" | "NPM" | "YARN" | "PNPM";
    /** 访问token */
    accessToken?: string;
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 仓库地址 */
    url: string;
    /** 仓库描述 */
    description?: string;
  };

  type AddRequirement = {
    /** 需求标题 */
    title: string;
    /** 需求类型 */
    typeId: string;
    /** 优先级ID */
    priorityId: string;
    /** 项目ID */
    projectId: string;
    /** 报告人 */
    reporterId: string;
    /** 处理人 */
    handlerId: string;
    /** 描述 */
    description?: string;
  };

  type AddRequirementPriority = {
    /** 优先级名称 */
    name: string;
    /** 卡片颜色 */
    color: string;
    /** 优先级描述 */
    description?: string;
  };

  type AddRequirementType = {
    /** 需求类型名称 */
    name: string;
    /** 需求类型描述 */
    description?: string;
  };

  type AddRole = {
    /** 排序值 */
    ordinal?: number;
    /** 父角色ID */
    parentId?: string;
    /** 角色名称 */
    name: string;
    /** 角色值 */
    value: string;
    /** 角色编码 */
    code: string;
  };

  type AddTask = {
    /** 任务标题 */
    title: string;
    /** 任务类型 */
    typeId: string;
    /** 需求ID */
    requirementId: string;
    /** 项目ID */
    projectId: string;
    /** 报告人 */
    reporterId: string;
    /** 处理人 */
    handlerId: string;
    /** 接口信息 */
    api?: Api;
    /** 描述 */
    description?: string;
  };

  type AddTaskStep = {
    /** 步骤名称 */
    name: string;
    /** 步骤描述 */
    description?: string;
  };

  type AddTaskType = {
    /** 任务类型名称 */
    name: string;
    /** 是否为后端接口任务 */
    backendApi?: boolean;
    /** 任务类型描述 */
    description?: string;
  };

  type AddTemplate = {
    /** 模板名称 */
    name: string;
    /** 模板描述 */
    description?: string;
    /** 任务步骤 */
    taskSteps: AddTaskStep[];
    /** 任务类型 */
    taskTypes: AddTaskType[];
    /** 需求优先级 */
    requirementPriorities: AddRequirementPriority[];
    /** 需求类型 */
    requirementTypes: AddRequirementType[];
  };

  type AddVersion = {
    /** 版本名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父级版本ID */
    parentId?: string;
    /** 计划开始时间 */
    plannedStartTime?: string;
    /** 计划结束时间 */
    plannedEndTime?: string;
    /** 版本描述 */
    description?: string;
  };

  type Api = {
    method?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
    path?: string;
  };

  type ApiDocsDetail = {
    /** 文档ID */
    id: string;
    /** 项目ID */
    projectId: string;
    /** 标题 */
    name?: string;
    /** 请求方法 */
    method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
    /** 请求路径 */
    path: string;
    /** 作者 */
    authors?: string[];
    /** 接口状态 */
    state: "DESIGN" | "DEVELOPING" | "COMPLETED";
    /** 接口规范 */
    apiSpecification?: ApiSpecification;
    /** 接口分组ID */
    groupId: string;
    /** 描述信息 */
    description?: string;
    /** 创建者 */
    creator?: string;
    /** 创建时间 */
    gmtCreate?: string;
    /** 更新时间 */
    gmtUpdate?: string;
    /** 更新者 */
    updater?: string;
  };

  type ApiDocsGroupDetail = {
    disabled?: boolean;
    /** 主键ID */
    id: string;
    /** 分组名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父分组ID */
    parentId?: string;
    /** 分组描述 */
    description?: string;
    /** 子分组 */
    children?: ApiDocsGroupVO[];
    /** 文档详情 */
    apiDocs?: ApiDocsVO[];
  };

  type ApiDocsGroupVO = {
    disabled?: boolean;
    /** 主键ID */
    id: string;
    /** 分组名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父分组ID */
    parentId?: string;
    /** 分组描述 */
    description?: string;
    /** 子分组 */
    children?: ApiDocsGroupVO[];
  };

  type ApiDocsVO = {
    /** 文档ID */
    id: string;
    /** 项目ID */
    projectId: string;
    /** 标题 */
    name?: string;
    /** 请求方法 */
    method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
    /** 请求路径 */
    path: string;
    /** 作者 */
    authors?: string[];
    /** 接口状态 */
    state: "DESIGN" | "DEVELOPING" | "COMPLETED";
    /** 接口规范 */
    apiSpecification?: ApiSpecification;
    /** 接口分组ID */
    groupId: string;
    /** 描述信息 */
    description?: string;
  };

  type ApiSpecification = {
    request: Request;
    responses: Response[];
  };

  type Binary = {
    type: "FILE" | "TEXT";
    value?: Record<string, any>;
    description?: string;
  };

  type BodyParam = {
    formDataParams?: FormDataParam[];
    binary?: Binary;
    raw?: Raw;
  };

  type CurrentUser = {
    /** 用户ID */
    id?: string;
    /** 用户名称 */
    username: string;
    /** 权限信息 */
    permission?: UserPermission;
    /** 用户拥有的角色信息 */
    roles?: RoleInfo[];
  };

  type deleteApiDocsGroupParams = {
    id: string;
  };

  type deleteApiDocsParams = {
    id: string;
  };

  type deleteIterationParams = {
    id: string;
  };

  type deletePermissionParams = {
    /** 权限ID */
    id: string;
  };

  type deleteProjectEnvironmentParams = {
    id: string;
  };

  type deleteProjectGroupParams = {
    id: string;
  };

  type deleteProjectParams = {
    id: string;
  };

  type deleteRepositoryParams = {
    id: string;
  };

  type deleteRequirementParams = {
    id: string;
  };

  type deleteRoleParams = {
    /** 角色ID */
    id: string;
  };

  type deleteTaskParams = {
    id: string;
  };

  type deleteTemplateParams = {
    id: string;
  };

  type deleteUserParams = {
    /** 用户ID */
    id: string;
  };

  type deleteVersionParams = {
    id: string;
  };

  type FormDataParam = {
    key: string;
    required?: boolean;
    type: "TEXT" | "FILE";
    value?: string;
    contentType?: string;
    description?: string;
  };

  type FormUrlencodedParam = {
    key: string;
    required?: boolean;
    value?: string;
    description?: string;
  };

  type getApiDocsDetailParams = {
    id: string;
  };

  type getIterationDetailParams = {
    id: string;
  };

  type getProjectDetailParams = {
    id: string;
  };

  type getProjectGroupDetailParams = {
    id: string;
  };

  type getTemplateDetailParams = {
    id: string;
  };

  type getVersionDetailParams = {
    id: string;
  };

  type HttpHeader = {
    key: string;
    required?: boolean;
    value?: string;
    description?: string;
  };

  type IterationDetail = {
    /** 迭代ID */
    id: string;
    /** 迭代名称 */
    name: string;
    /** 迭代状态 */
    status: "PLANNED" | "ONGOING" | "DONE" | "ARCHIVED";
    /** 版本ID */
    versionId: string;
    /** 计划开始时间 */
    plannedStartTime?: string;
    /** 计划结束时间 */
    plannedEndTime?: string;
    /** 实际结束时间 */
    actualEndTime?: string;
    /** 实际开始时间 */
    actualStartTime?: string;
    /** 迭代描述 */
    description?: string;
    /** 需求信息 */
    requirements?: string[];
    /** 需求统计 */
    requirementStatistics?: RequirementStatistics;
  };

  type listPermissionParams = {
    /** 角色ID */
    roleId: string;
  };

  type listProjectEnvironmentParams = {
    projectId: string;
  };

  type listProjectGroupUserParams = {
    projectGroupId: string;
    /** 用户名 */
    username: string;
  };

  type listRepositoryParams = {
    name?: string;
  };

  type ListRequirement = {
    /** 需求标题 */
    title?: string;
    /** 项目ID */
    projectId: string;
    /** 需求类型 */
    typeId?: string;
    /** 优先级ID */
    priorityId?: string;
    /** 需求状态 */
    status?: "TO_BE_PLANNED" | "PLANNED" | "PROCESSING" | "DONE" | "CLOSED";
    /** 跳过几条数据 */
    offset: string;
    /** 查询条数 */
    limit: string;
  };

  type listRequirementByIterationIdParams = {
    iterationId: string;
  };

  type listRequirementParams = {
    listRequirement: ListRequirement;
  };

  type ListRequirementTask = {
    /** 迭代ID */
    iterationId: string;
    /** 标题 */
    title?: string;
    /** 优先级ID */
    priorityId?: string;
    /** 处理人ID */
    handlerId?: string;
  };

  type listRolesParams = {
    /** 用户ID */
    userId: string;
  };

  type listTemplateParams = {
    /** 模板名称 */
    name?: string;
  };

  type listUserParams = {
    /** 用户名 */
    username: string;
  };

  type Member = {
    disabled?: boolean;
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
  };

  type moveTaskParams = {
    id: string;
    taskStepId: string;
  };

  type PagePermission = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 权限ID */
    id?: string;
    /** 权限名称 */
    name?: string;
    /** 权限值 */
    value?: string;
    /** 父权限ID */
    parentId?: string;
    /** 权限类型 */
    type?: "MENU" | "BUTTON" | "API";
    /** 请求URL */
    httpUrl?: string;
    /** 请求方法 */
    httpMethod?:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "PATCH"
      | "DELETE"
      | "OPTIONS";
    /** 权限描述 */
    description?: string;
  };

  type pagePermissionParams = {
    pagePermission: PagePermission;
  };

  type PagePermissionVO = {
    records?: PermissionVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageProject = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 项目ID */
    id?: string;
    /** 项目名称 */
    name?: string;
    /** 项目描述 */
    description?: string;
  };

  type PageProjectGroup = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 项目组ID */
    id?: string;
    /** 项目组名称 */
    name?: string;
    /** 项目组描述 */
    description?: string;
  };

  type pageProjectGroupParams = {
    page: PageProjectGroup;
  };

  type PageProjectGroupVO = {
    records?: ProjectGroupVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type pageProjectParams = {
    pageProjectFilter: PageProject;
  };

  type PageProjectVO = {
    records?: ProjectVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageRepository = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 仓库ID */
    id?: string;
    /** 仓库类型 */
    type?: "GITLAB" | "GITHUB";
    /** 仓库名称 */
    name?: string;
    /** 构建工具 */
    buildTool?: "MAVEN" | "GRADLE" | "NPM" | "YARN" | "PNPM";
  };

  type pageRepositoryParams = {
    pageRepository: PageRepository;
  };

  type PageRepositoryVO = {
    records?: RepositoryVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageRole = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 角色ID */
    id?: string;
    /** 角色名称 */
    name?: string;
    /** 角色值 */
    value?: string;
    /** 角色编码 */
    code?: string;
    /** 父角色ID */
    parentId?: string;
  };

  type pageRoleParams = {
    pageRole: PageRole;
  };

  type PageRoleVO = {
    records?: RoleVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageTemplate = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 模板ID */
    id?: string;
    /** 模板名称 */
    name?: string;
    /** 模板描述 */
    description?: string;
  };

  type pageTemplateParams = {
    pageTemplate: PageTemplate;
  };

  type PageTemplateVO = {
    records?: TemplateVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PageUser = {
    /** 页数 */
    current?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 用户ID */
    id?: string;
    /** 用户名 */
    username?: string;
    /** 账号过期 */
    accountExpired?: "YES" | "NO";
    /** 账号锁定 */
    accountLocked?: "YES" | "NO";
    /** 密码过期 */
    credentialsExpired?: "YES" | "NO";
    /** 账号启用 */
    enabled?: "YES" | "NO";
  };

  type pageUserParams = {
    pageUser: PageUser;
  };

  type PageUserVO = {
    records?: UserVO[];
    pageNumber?: number;
    pageSize?: number;
    totalPage?: number;
    totalRow?: number;
    optimizeCountQuery?: boolean;
  };

  type PathParam = {
    key: string;
    value?: string;
    description?: string;
  };

  type PermissionVO = {
    /** 权限ID */
    id: string;
    /** 权限名称 */
    name: string;
    /** 权限类型 */
    type: "MENU" | "BUTTON" | "API";
    /** 请求URL */
    httpUrl?: string;
    /** 路径 */
    path?: string;
    /** 请求方法 */
    httpMethod?:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "PATCH"
      | "DELETE"
      | "OPTIONS";
    /** 权限描述 */
    description?: string;
    /** 权限值 */
    value: string;
    /** 序号 */
    ordinal: number;
    /** 父权限ID */
    parentId?: string;
  };

  type PlanningRequirement = {
    /** 需求ID */
    requirementId: string;
    /** 迭代ID */
    iterationId?: string;
  };

  type ProjectAutomationDTO = {
    /** 触发动作 */
    triggerAction:
      | "START_ITERATION"
      | "END_ITERATION"
      | "CREATE_REQUIREMENT"
      | "UPDATE_REQUIREMENT"
      | "UPDATE_REQUIREMENT_STATUS"
      | "DELETE_REQUIREMENT"
      | "CREATE_TASK"
      | "UPDATE_TASK"
      | "UPDATE_TASK_STEP"
      | "DELETE_TASK";
    /** 需求类型ID集合 */
    requirementTypeIds?: string[];
    /** 任务类型ID集合 */
    taskTypeIds?: string[];
    /** 前置任务步骤ID */
    preTaskStepId?: string;
    /** 后置任务步骤ID */
    afterTaskStepId?: string;
    /** 前置需求状态 */
    preRequirementStatus?:
      | "TO_BE_PLANNED"
      | "PLANNED"
      | "PROCESSING"
      | "DONE"
      | "CLOSED";
    /** 后置需求状态 */
    afterRequirementStatus?:
      | "TO_BE_PLANNED"
      | "PLANNED"
      | "PROCESSING"
      | "DONE"
      | "CLOSED";
    /** 自动化动作 */
    automationAction:
      | "CREATE_BRANCH"
      | "DELETE_BRANCH"
      | "CREATE_PR"
      | "CLOSE_PR"
      | "DELETE_PR"
      | "CREATE_ISSUE"
      | "CLOSE_ISSUE"
      | "DELETE_ISSUE"
      | "SEND_EMAIL"
      | "FEI_SHU_NOTIFY"
      | "DING_DING_NOTIFY"
      | "WORK_WEI_XIN_NOTIFY"
      | "INTERNAL_MESSAGE";
    /** 代码仓库ID */
    repositoryIds?: string[];
  };

  type ProjectAutomationVO = {
    /** 触发动作 */
    triggerAction:
      | "START_ITERATION"
      | "END_ITERATION"
      | "CREATE_REQUIREMENT"
      | "UPDATE_REQUIREMENT"
      | "UPDATE_REQUIREMENT_STATUS"
      | "DELETE_REQUIREMENT"
      | "CREATE_TASK"
      | "UPDATE_TASK"
      | "UPDATE_TASK_STEP"
      | "DELETE_TASK";
    /** 需求类型ID集合 */
    requirementTypeIds?: string[];
    /** 任务类型ID集合 */
    taskTypeIds?: string[];
    /** 前置任务步骤ID */
    preTaskStepId?: string;
    /** 后置任务步骤ID */
    afterTaskStepId?: string;
    /** 前置需求状态 */
    preRequirementStatus?:
      | "TO_BE_PLANNED"
      | "PLANNED"
      | "PROCESSING"
      | "DONE"
      | "CLOSED";
    /** 后置需求状态 */
    afterRequirementStatus?:
      | "TO_BE_PLANNED"
      | "PLANNED"
      | "PROCESSING"
      | "DONE"
      | "CLOSED";
    /** 自动化动作 */
    automationAction:
      | "CREATE_BRANCH"
      | "DELETE_BRANCH"
      | "CREATE_PR"
      | "CLOSE_PR"
      | "DELETE_PR"
      | "CREATE_ISSUE"
      | "CLOSE_ISSUE"
      | "DELETE_ISSUE"
      | "SEND_EMAIL"
      | "FEI_SHU_NOTIFY"
      | "DING_DING_NOTIFY"
      | "WORK_WEI_XIN_NOTIFY"
      | "INTERNAL_MESSAGE";
    /** 代码仓库ID */
    repositoryIds?: string[];
  };

  type ProjectDetail = {
    /** 项目ID */
    id: string;
    /** 项目名称 */
    name: string;
    /** 模板ID */
    templateId: string;
    /** 项目组ID */
    projectGroupId: string;
    /** 项目描述 */
    description?: string;
    /** Swagger 同步配置 */
    swaggerSync?: SwaggerSync;
    /** qs 配置 */
    qsConfig?: QsConfig;
    /** 创建时间 */
    gmtCreate: string;
    /** 所属项目组 */
    projectGroup: SimpleProjectGroup;
    /** 项目成员ID */
    memberIds?: string[];
    /** 项目成员 */
    members?: Member[];
    /** 项目自动化配置 */
    automations?: ProjectAutomationVO[];
  };

  type ProjectEnvironmentVO = {
    /** 主键ID */
    id: string;
    /** 环境名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 协议 */
    schema: "HTTP" | "HTTPS";
    /** 主机名 */
    host: string;
    /** 端口号 */
    port?: number;
    /** 统一前缀 */
    prefix?: string;
    /** 统一请求头 */
    headers?: HttpHeader[];
  };

  type ProjectGroupDetail = {
    /** 项目组ID */
    id: string;
    /** 项目组名称 */
    name?: string;
    /** 项目组成员 */
    members?: Member[];
    /** 项目组描述 */
    description?: string;
    /** 创建时间 */
    gmtCreate: string;
  };

  type ProjectGroupMember = {
    /** 项目组ID */
    projectGroupId: string;
    /** 成员用户ID集合 */
    memberIds?: string[];
  };

  type ProjectGroupVO = {
    disabled?: boolean;
    /** 项目组ID */
    id: string;
    /** 项目组名称 */
    name: string;
    /** 项目组描述 */
    description?: string;
  };

  type ProjectVO = {
    /** 项目ID */
    id: string;
    /** 项目名称 */
    name: string;
    /** 模板ID */
    templateId: string;
    /** 项目组ID */
    projectGroupId: string;
    /** 项目描述 */
    description?: string;
    /** Swagger 同步配置 */
    swaggerSync?: SwaggerSync;
    /** qs 配置 */
    qsConfig?: QsConfig;
    /** 创建时间 */
    gmtCreate: string;
  };

  type QsConfig = {
    /** 是否启用配置 */
    enabled: boolean;
    /** 是否对 URL 进行编码 */
    encode: boolean;
    /** 仅编码值，不编码键 */
    encodeValuesOnly: boolean;
    /** 是否加 ? 前缀 */
    addQueryPrefix: boolean;
    /** 参数分隔符 */
    delimiter: string;
    /** 是否跳过 null/undefined */
    skipNulls: boolean;
    /** 处理 null 时仅输出键 */
    strictNullHandling: boolean;
    /** 是否用 . 表示嵌套对象 */
    allowDots: boolean;
    /** 数组格式 */
    arrayFormat: "indices" | "brackets" | "repeat" | "comma";
    /** 是否给数组的键添加索引 */
    indices: boolean;
    /** 编码格式 */
    format: "RFC1738" | "RFC3986";
    /** 数组分隔符 */
    arrayFormatSeparator: string;
    /** 允许空数组 */
    allowEmptyArrays: boolean;
  };

  type QueryParam = {
    key: string;
    type?: "STRING" | "INTEGER" | "BOOLEAN" | "NUMBER" | "ARRAY" | "OBJECT";
    required?: boolean;
    value?: string;
    jsonSchema?: string;
    description?: string;
  };

  type Raw = {
    type?:
      | "X_WWW_FORM_URLENCODED"
      | "TEXT"
      | "JSON"
      | "JAVASCRIPT"
      | "HTML"
      | "XML";
    value?: string;
    urlencodedParams?: FormUrlencodedParam[];
    jsonSchema?: string;
    description?: string;
  };

  type RepositoryVO = {
    disabled?: boolean;
    /** 仓库ID */
    id: string;
    /** 仓库名称 */
    name: string;
    /** 仓库类型 */
    type: "GITLAB" | "GITHUB";
    /** 构建工具 */
    buildTool: "MAVEN" | "GRADLE" | "NPM" | "YARN" | "PNPM";
    /** 访问token */
    accessToken?: string;
    /** 仓库地址 */
    url: string;
    /** 仓库描述 */
    description?: string;
  };

  type Request = {
    headers?: HttpHeader[];
    queryParams?: QueryParam[];
    pathParams?: PathParam[];
    bodyParam?: BodyParam;
  };

  type RequirementPriorityVO = {
    disabled?: boolean;
    /** 优先级ID */
    id: string;
    /** 优先级名称 */
    name: string;
    /** 卡片颜色 */
    color: string;
    /** 优先级描述 */
    description?: string;
  };

  type RequirementStatistics = {
    /** 迭代ID */
    iterationId?: string;
    /** 总数 */
    total?: number;
    /** 已规划数量 */
    planned?: number;
    /** 进行中数量 */
    processing?: number;
    /** 已完成数量 */
    done?: number;
    /** 已关闭数量 */
    closed?: number;
  };

  type RequirementTask = {
    /** 需求ID */
    id: string;
    /** 需求标题 */
    title: string;
    /** 需求类型 */
    typeId: string;
    /** 需求状态 */
    status: "TO_BE_PLANNED" | "PLANNED" | "PROCESSING" | "DONE" | "CLOSED";
    /** 优先级ID */
    priorityId: string;
    /** 项目ID */
    projectId: string;
    /** 迭代ID */
    iterationId?: string;
    /** 报告人 */
    reporterId: string;
    /** 报告人用户名 */
    reporter?: string;
    /** 处理人 */
    handlerId: string;
    /** 处理人用户名 */
    handler?: string;
    /** 描述 */
    description?: string;
    /** 需求任务 */
    tasks?: Record<string, any>;
  };

  type requirementTaskParams = {
    listRequirementTask: ListRequirementTask;
  };

  type RequirementTypeVO = {
    disabled?: boolean;
    /** 需求类型ID */
    id: string;
    /** 需求类型名称 */
    name: string;
    /** 需求类型描述 */
    description?: string;
  };

  type RequirementVO = {
    /** 需求ID */
    id: string;
    /** 需求标题 */
    title: string;
    /** 需求类型 */
    typeId: string;
    /** 需求状态 */
    status: "TO_BE_PLANNED" | "PLANNED" | "PROCESSING" | "DONE" | "CLOSED";
    /** 优先级ID */
    priorityId: string;
    /** 项目ID */
    projectId: string;
    /** 迭代ID */
    iterationId?: string;
    /** 报告人 */
    reporterId: string;
    /** 报告人用户名 */
    reporter?: string;
    /** 处理人 */
    handlerId: string;
    /** 处理人用户名 */
    handler?: string;
    /** 描述 */
    description?: string;
  };

  type Response = {
    statusCode: number;
    headers?: HttpHeader[];
    jsonSchema?: string;
    description?: string;
  };

  type RoleInfo = {
    /** 角色ID */
    id: string;
    /** 角色名称 */
    name: string;
    /** 角色值 */
    value: string;
  };

  type RolePermissions = {
    /** 角色ID */
    roleId?: string;
    /** 权限ID集合 */
    permissionIds?: string[];
  };

  type RoleVO = {
    /** 角色ID */
    id: string;
    /** 父角色ID */
    parentId?: string;
    /** 序号 */
    ordinal?: number;
    /** 角色名称 */
    name: string;
    /** 角色值 */
    value: string;
    /** 角色编码 */
    code: string;
    /** 父角色编码 */
    parentCode?: string;
    /** 创建时间 */
    gmtCreate: string;
  };

  type SaveApiDocs = {
    /** 标题 */
    name?: string;
    /** 请求方法 */
    method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
    /** 请求路径 */
    path: string;
    /** 接口规范 */
    apiSpecification?: ApiSpecification;
    /** 项目ID */
    projectId: string;
    /** 接口分组ID */
    groupId: string;
    /** 描述信息 */
    description?: string;
  };

  type SaveApiDocsGroup = {
    /** 分组名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父分组ID */
    parentId?: string;
    /** 项目描述 */
    description?: string;
  };

  type SaveProjectEnvironment = {
    /** 环境名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 协议 */
    schema: "HTTP" | "HTTPS";
    /** 主机名 */
    host: string;
    /** 端口号 */
    port?: number;
    /** 统一前缀 */
    prefix?: string;
    /** 统一请求头 */
    headers?: HttpHeader[];
    /** 环境描述 */
    description?: string;
  };

  type SaveQsConfig = {
    /** 是否启用配置 */
    enabled: boolean;
    /** 是否对 URL 进行编码 */
    encode: boolean;
    /** 仅编码值，不编码键 */
    encodeValuesOnly: boolean;
    /** 是否加 ? 前缀 */
    addQueryPrefix: boolean;
    /** 参数分隔符 */
    delimiter: string;
    /** 是否跳过 null/undefined */
    skipNulls: boolean;
    /** 处理 null 时仅输出键 */
    strictNullHandling: boolean;
    /** 是否用 . 表示嵌套对象 */
    allowDots: boolean;
    /** 数组格式 */
    arrayFormat: "indices" | "brackets" | "repeat" | "comma";
    /** 是否给数组的键添加索引 */
    indices: boolean;
    /** 编码格式 */
    format: "RFC1738" | "RFC3986";
    /** 数组分隔符 */
    arrayFormatSeparator: string;
    /** 允许空数组 */
    allowEmptyArrays: boolean;
    /** 项目ID */
    projectId?: string;
  };

  type SaveSwaggerSync = {
    /** 项目ID */
    projectId: string;
    /** Swagger 的json数据地址 */
    jsonUrl: string;
    /** 是否开启同步 */
    enable?: boolean;
    /** 定时任务表达式 */
    cron: string;
    /** 新接口的默认状态 */
    defaultState: "DESIGN" | "DEVELOPING" | "COMPLETED";
    /** 同步策略 */
    syncStrategy: "ADD_ONLY" | "FULL_REPLACE" | "PARTIAL_UPDATE";
  };

  type SimpleIteration = {
    /** 迭代ID */
    id: string;
    /** 迭代名称 */
    name: string;
    /** 迭代状态 */
    status: "PLANNED" | "ONGOING" | "DONE" | "ARCHIVED";
  };

  type SimpleProject = {
    /** 项目ID */
    id?: string;
    /** 项目名称 */
    name?: string;
  };

  type SimpleProjectGroup = {
    /** 项目组ID */
    id: string;
    /** 项目组名称 */
    name: string;
  };

  type SimpleTemplate = {
    /** 模板ID */
    id: string;
    /** 模板名称 */
    name: string;
  };

  type SimpleUser = {
    disabled?: boolean;
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
  };

  type SwaggerSync = {
    jsonUrl: string;
    enable?: boolean;
    cron: string;
    defaultState: "DESIGN" | "DEVELOPING" | "COMPLETED";
    syncStrategy: "ADD_ONLY" | "FULL_REPLACE" | "PARTIAL_UPDATE";
  };

  type TaskStepVO = {
    disabled?: boolean;
    /** 步骤ID */
    id: string;
    /** 步骤名称 */
    name: string;
    /** 步骤描述 */
    description?: string;
  };

  type TaskTypeVO = {
    disabled?: boolean;
    /** 任务类型ID */
    id: string;
    /** 任务类型名称 */
    name: string;
    /** 是否为后端接口任务 */
    backendApi?: boolean;
    /** 任务类型描述 */
    description?: string;
  };

  type TaskVO = {
    /** ID */
    id: string;
    /** 任务标题 */
    title: string;
    /** 任务类型 */
    typeId: string;
    /** 接口信息 */
    api?: Api;
    /** 当前所在的任务步骤ID */
    taskStepId: string;
    /** 需求ID */
    requirementId: string;
    /** 项目ID */
    projectId: string;
    /** 报告人 */
    reporterId: string;
    /** 报告人用户名 */
    reporter?: string;
    /** 处理人 */
    handlerId: string;
    /** 处理人用户名 */
    handler?: string;
    /** 描述 */
    description?: string;
  };

  type TemplateDetail = {
    /** 模板ID */
    id: string;
    /** 模板名称 */
    name: string;
    /** 模板描述 */
    description?: string;
    /** 任务步骤 */
    taskSteps: TaskStepVO[];
    /** 任务类型 */
    taskTypes: TaskTypeVO[];
    /** 需求优先级 */
    requirementPriorities: RequirementPriorityVO[];
    /** 需求优类型 */
    requirementTypes: RequirementTypeVO[];
  };

  type TemplateVO = {
    disabled?: boolean;
    /** 模板ID */
    id: string;
    /** 模板名称 */
    name: string;
    /** 模板描述 */
    description?: string;
  };

  type treeApiDocsGroupDetailParams = {
    projectId: string;
    keyword?: string;
  };

  type TreePermission = {
    /** 权限ID */
    id: string;
    /** 权限名称 */
    name: string;
    /** 权限类型 */
    type: "MENU" | "BUTTON" | "API";
    /** 请求URL */
    httpUrl?: string;
    /** 请求方法 */
    httpMethod?:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "PATCH"
      | "DELETE"
      | "OPTIONS";
    /** 权限描述 */
    description?: string;
    /** 权限值 */
    value: string;
    /** 路径 */
    path?: string;
    /** 父权限ID */
    parentId?: string;
    /** 子权限信息 */
    children?: TreePermission[];
  };

  type TreeRole = {
    /** 角色ID */
    id: string;
    /** 角色名称 */
    name: string;
    /** 角色值 */
    value: string;
    /** 角色编码 */
    code: string;
    /** 父角色ID */
    parentId?: string;
    /** 子角色 */
    children?: TreeRole[];
  };

  type TreeVersionDetail = {
    /** 版本ID */
    id: string;
    /** 版本名称 */
    name: string;
    /** 版本状态 */
    status: "PLANNED" | "ONGOING" | "DONE" | "ARCHIVED";
    /** 子版本信息 */
    children?: TreeVersionDetail[];
    /** 迭代信息 */
    iterations?: SimpleIteration[];
  };

  type treeVersionDetailParams = {
    projectId: string;
  };

  type UpdateApiDocs = {
    /** 标题 */
    name?: string;
    /** 请求方法 */
    method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
    /** 请求路径 */
    path: string;
    /** 接口规范 */
    apiSpecification?: ApiSpecification;
    /** 项目ID */
    projectId: string;
    /** 接口分组ID */
    groupId: string;
    /** 描述信息 */
    description?: string;
    /** 接口文档ID */
    id?: string;
    /** 接口状态 */
    state: "DESIGN" | "DEVELOPING" | "COMPLETED";
  };

  type UpdateApiDocsGroup = {
    /** 分组名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父分组ID */
    parentId?: string;
    /** 项目描述 */
    description?: string;
    /** 分组ID */
    id: string;
  };

  type UpdateIteration = {
    /** 迭代名称 */
    name: string;
    /** 版本ID */
    versionId: string;
    /** 计划开始时间 */
    plannedStartTime?: string;
    /** 计划结束时间 */
    plannedEndTime?: string;
    /** 迭代描述 */
    description?: string;
    /** 迭代ID */
    id: string;
  };

  type UpdateIterationStatus = {
    /** 主键ID */
    id: string;
    /** 下一个状态 */
    nextStatus: "PLANNED" | "ONGOING" | "DONE" | "ARCHIVED";
  };

  type UpdatePermission = {
    /** 主键ID */
    id: string;
    /** 排序值 */
    ordinal?: number;
    /** 父ID */
    parentId?: string;
    /** 权限名称 */
    name: string;
    /** 权限类型 */
    type: "MENU" | "BUTTON" | "API";
    /** 前端路由 */
    route?: string;
    /** 权限值 */
    value?: string;
    /** 请求地址 */
    httpUrl?: string;
    /** 请求方法 */
    httpMethod?:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "PATCH"
      | "DELETE"
      | "OPTIONS";
    /** 权限描述 */
    description?: string;
  };

  type UpdateProject = {
    /** 项目名称 */
    name: string;
    /** 模板ID */
    templateId: string;
    /** 项目自动化 */
    automations?: ProjectAutomationDTO[];
    /** 项目组ID */
    projectGroupId: string;
    /** 项目成员ID */
    memberIds?: string[];
    /** 项目描述 */
    description?: string;
    /** 项目ID */
    id: string;
  };

  type UpdateProjectEnvironment = {
    /** 环境名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 协议 */
    schema: "HTTP" | "HTTPS";
    /** 主机名 */
    host: string;
    /** 端口号 */
    port?: number;
    /** 统一前缀 */
    prefix?: string;
    /** 统一请求头 */
    headers?: HttpHeader[];
    /** 环境描述 */
    description?: string;
    /** 主键ID */
    id: string;
  };

  type UpdateProjectGroup = {
    /** 项目组名称 */
    name: string;
    /** 项目组描述 */
    description?: string;
    /** 项目组ID */
    id: string;
  };

  type UpdateRepository = {
    /** 仓库名称 */
    name: string;
    /** 仓库类型 */
    type: "GITLAB" | "GITHUB";
    /** 构建工具 */
    buildTool: "MAVEN" | "GRADLE" | "NPM" | "YARN" | "PNPM";
    /** 访问token */
    accessToken?: string;
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 仓库地址 */
    url: string;
    /** 仓库描述 */
    description?: string;
    id: string;
  };

  type UpdateRequirement = {
    /** 需求标题 */
    title: string;
    /** 需求类型 */
    typeId: string;
    /** 优先级ID */
    priorityId: string;
    /** 项目ID */
    projectId: string;
    /** 报告人 */
    reporterId: string;
    /** 处理人 */
    handlerId: string;
    /** 描述 */
    description?: string;
    /** 需求ID */
    id: string;
  };

  type UpdateRequirementPriority = {
    /** 优先级名称 */
    name: string;
    /** 卡片颜色 */
    color: string;
    /** 优先级描述 */
    description?: string;
    /** 优先级ID */
    id: string;
  };

  type UpdateRequirementType = {
    /** 需求类型名称 */
    name: string;
    /** 需求类型描述 */
    description?: string;
    /** 需求类型ID */
    id: string;
  };

  type UpdateRole = {
    /** 主键ID */
    id: string;
    /** 排序值 */
    ordinal?: number;
    /** 父角色ID */
    parentId?: string;
    /** 角色名称 */
    name: string;
    /** 角色值 */
    value: string;
    /** 角色编码 */
    code: string;
  };

  type UpdateTask = {
    /** 任务标题 */
    title: string;
    /** 任务类型 */
    typeId: string;
    /** 需求ID */
    requirementId: string;
    /** 项目ID */
    projectId: string;
    /** 报告人 */
    reporterId: string;
    /** 处理人 */
    handlerId: string;
    /** 接口信息 */
    api?: Api;
    /** 描述 */
    description?: string;
    /** 任务ID */
    id: string;
  };

  type UpdateTaskStep = {
    /** 步骤名称 */
    name: string;
    /** 步骤描述 */
    description?: string;
    /** 步骤ID */
    id: string;
  };

  type UpdateTaskType = {
    /** 任务类型名称 */
    name: string;
    /** 是否为后端接口任务 */
    backendApi?: boolean;
    /** 任务类型描述 */
    description?: string;
    /** 任务类型ID */
    id: string;
  };

  type UpdateTemplate = {
    /** 模板名称 */
    name: string;
    /** 模板描述 */
    description?: string;
    /** 任务步骤 */
    taskSteps: UpdateTaskStep[];
    /** 任务类型 */
    taskTypes: UpdateTaskType[];
    /** 需求优先级 */
    requirementPriorities: UpdateRequirementPriority[];
    /** 需求类型 */
    requirementTypes: UpdateRequirementType[];
    /** 模板ID */
    id: string;
  };

  type UpdateUser = {
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 账号过期 */
    accountExpired: "YES" | "NO";
    /** 账号未锁定 */
    accountLocked: "YES" | "NO";
    /** 密码未过期 */
    credentialsExpired: "YES" | "NO";
    /** 账号启用 */
    enabled: "YES" | "NO";
  };

  type UpdateVersion = {
    /** 版本名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父级版本ID */
    parentId?: string;
    /** 计划开始时间 */
    plannedStartTime?: string;
    /** 计划结束时间 */
    plannedEndTime?: string;
    /** 版本描述 */
    description?: string;
    /** 版本ID */
    id: string;
  };

  type UserDTO = {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
  };

  type UserPermission = {
    /** 路由权限 */
    routes?: string[];
  };

  type UserProject = {
    /** 项目组ID */
    id: string;
    /** 项目组名 */
    name?: string;
    projects?: SimpleProject[];
  };

  type UserRoles = {
    /** 用户ID */
    userId?: string;
    /** 角色ID集合 */
    roleIds?: string[];
  };

  type UserVO = {
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 账号过期 */
    accountExpired: "YES" | "NO";
    /** 账号未锁定 */
    accountLocked: "YES" | "NO";
    /** 密码未过期 */
    credentialsExpired: "YES" | "NO";
    /** 账号启用 */
    enabled: "YES" | "NO";
    /** 注册时间 */
    gmtCreate: string;
  };

  type VersionDetail = {
    /** 版本ID */
    id: string;
    /** 版本名称 */
    name: string;
    /** 项目ID */
    projectId: string;
    /** 父版本ID */
    parentId?: string;
    /** 版本状态 */
    status: "PLANNED" | "ONGOING" | "DONE" | "ARCHIVED";
    /** 计划开始时间 */
    plannedStartTime?: string;
    /** 计划结束时间 */
    plannedEndTime?: string;
    /** 实际结束时间 */
    actualEndTime?: string;
    /** 实际开始时间 */
    actualStartTime?: string;
    /** 需求统计 */
    requirementStatistics?: RequirementStatistics;
    /** 子版本 */
    children?: VersionDetail[];
    /** 在该版本的迭代信息 */
    iterations?: IterationDetail[];
    /** 版本描述 */
    description?: string;
  };
}
