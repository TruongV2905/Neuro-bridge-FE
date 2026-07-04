// Seed test data for Neuro-Bridge:
//   - 1 client (chị Lan)
//   - 3 experts (Nam, Minh, Long)
//   - Lan tạo 1 jobpost -> PUBLIC
//   - 3 expert apply
//   - Lan hire Nam -> tạo workspace
//
// Run:  node scripts/seed-test-data.mjs
// Requires: BE chạy tại http://localhost:8080 và có skill id=1 trong DB.

const BASE = process.env.API_BASE_URL ?? "http://localhost:8080/api";
const PASSWORD = "Password@123";
const SKILL_IDS = [1];

const CLIENT = {
  email: "lan@test.com",
  fullName: "Nguyen Thi Lan",
  gender: "FEMALE",
  address: "123 Nguyen Trai, Q1, TPHCM",
  dateOfBirth: "1992-05-14",
  phone: "0901234567",
  password: PASSWORD,
  companyName: "Lan Cosmetics",
  industry: "Beauty & Cosmetics",
  companyDescription: "Shop mỹ phẩm online chuyên hàng nội địa Nhật.",
  avatarUrl: "",
};

const EXPERTS = [
  {
    label: "Nam",
    email: "nam@test.com",
    fullName: "Tran Van Nam",
    gender: "MALE",
    dateOfBirth: "1995-03-10",
    address: "45 Le Loi, Q1, TPHCM",
    phone: "0912345678",
    password: PASSWORD,
    skillIds: SKILL_IDS,
    avatarUrl: "",
  },
  {
    label: "Minh",
    email: "minh@test.com",
    fullName: "Le Thi Minh",
    gender: "FEMALE",
    dateOfBirth: "1996-07-22",
    address: "78 Dien Bien Phu, Binh Thanh, TPHCM",
    phone: "0923456789",
    password: PASSWORD,
    skillIds: SKILL_IDS,
    avatarUrl: "",
  },
  {
    label: "Long",
    email: "long@test.com",
    fullName: "Pham Hoang Long",
    gender: "MALE",
    dateOfBirth: "1993-11-02",
    address: "12 Vo Van Tan, Q3, TPHCM",
    phone: "0934567890",
    password: PASSWORD,
    skillIds: SKILL_IDS,
    avatarUrl: "",
  },
];

const JOBPOST = {
  title: "Cần chatbot AI tư vấn khách hàng cho shop mỹ phẩm",
  description:
    "Muốn xây chatbot Facebook Messenger tự động chào khách, tư vấn skincare, gợi ý sản phẩm dựa trên loại da và ngân sách. Data khoảng 500 SKU + FAQ có sẵn.",
  requiredSkillIds: SKILL_IDS,
  preferredSkillIds: [],
  budgetFrom: 5000000,
  budgetTo: 10000000,
  estimatedDays: 14,
};

const PROPOSALS = {
  Nam: {
    proposedBudget: 7000000,
    estimatedDays: 12,
    title: "Chatbot RAG học từ FAQ + catalogue của shop",
    strategySummary:
      "Dùng LangChain + OpenAI embeddings để index 500 SKU và FAQ. Fine-tune persona theo brand voice của shop. Tích hợp trực tiếp Messenger Webhook. Deliver: bot working + admin dashboard xem log chat.",
    unlockCost: 200000,
    strategyDetail:
      "Tuần 1: crawl + chuẩn hoá dữ liệu SKU, tạo vector store. Tuần 2: build LangChain agent + Messenger webhook, KPI 90% intent chính xác.",
  },
  Minh: {
    proposedBudget: 8500000,
    estimatedDays: 14,
    title: "Chatbot đa kênh (Messenger + Web) dùng GPT-4o mini",
    strategySummary:
      "Kiến trúc microservice với FastAPI + Redis cache. Hỗ trợ đa kênh và analytics dashboard theo dõi tỉ lệ convert theo bot.",
    unlockCost: undefined,
    strategyDetail: undefined,
  },
  Long: {
    proposedBudget: 6000000,
    estimatedDays: 10,
    title: "MVP chatbot Messenger dùng template Botpress",
    strategySummary:
      "Dùng Botpress open-source + prompt engineering để rút ngắn thời gian dev. Focus vào flow tư vấn nhanh, không cần fine-tune.",
    unlockCost: undefined,
    strategyDetail: undefined,
  },
};

async function apiCall(method, path, { token, body } = {}) {
  const url = `${BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function registerOrLogin(kind, payload) {
  const path = `/identity/auth/register/${kind}`;
  const reg = await apiCall("POST", path, { body: payload });
  if (!reg.ok) {
    const msg = reg.data?.message ?? "";
    if (
      reg.status === 409 ||
      /exist|đã|duplicate/i.test(String(msg))
    ) {
      console.log(`[SKIP] ${kind} ${payload.email} đã tồn tại, thử login...`);
    } else {
      console.error(`[ERR] register ${kind}`, reg.status, reg.data);
      throw new Error(`Register ${kind} failed`);
    }
  } else {
    console.log(`[OK] Đã tạo ${kind}: ${payload.email}`);
  }

  const login = await apiCall("POST", "/identity/auth/login", {
    body: { email: payload.email, password: payload.password },
  });
  if (!login.ok) {
    console.error(`[ERR] login ${payload.email}`, login.status, login.data);
    throw new Error(`Login ${payload.email} failed`);
  }
  const user = login.data?.result;
  console.log(
    `      login OK -> code=${user.code} role=${user.role}`,
  );
  return { token: user.accessToken, code: user.code, user };
}

async function main() {
  console.log(`>>> Seed test data vào ${BASE}\n`);

  // 1. Register + login client
  console.log("[1/6] Client (chị Lan)");
  const lan = await registerOrLogin("client", CLIENT);

  // 2. Register + login 3 experts
  console.log("\n[2/6] 3 Experts");
  const expertMap = {};
  for (const e of EXPERTS) {
    console.log(`  - ${e.label} (${e.email})`);
    const info = await registerOrLogin("expert", e);
    expertMap[e.label] = info;
  }

  // 3. Client tạo jobpost
  console.log("\n[3/6] Lan tạo JobPost");
  const created = await apiCall("POST", "/jobpost/job-post", {
    token: lan.token,
    body: JOBPOST,
  });
  if (!created.ok) {
    console.error("[ERR] create jobpost", created.status, created.data);
    throw new Error("Create jobpost failed");
  }
  const jobPost = created.data.result;
  console.log(`      OK -> id=${jobPost.id}`);

  // 4. Đổi status PUBLIC
  console.log("\n[4/6] Đổi status JobPost -> PUBLIC");
  const statusRes = await apiCall(
    "PATCH",
    `/jobpost/job-post/${jobPost.id}/status?jobPostStatus=PUBLIC`,
    { token: lan.token },
  );
  if (!statusRes.ok) {
    console.error("[ERR] change status", statusRes.status, statusRes.data);
    throw new Error("Change status failed");
  }
  console.log("      OK");

  // 5. Mỗi expert apply
  console.log("\n[5/6] 3 Experts apply");
  for (const e of EXPERTS) {
    const expert = expertMap[e.label];
    const proposal = PROPOSALS[e.label];
    const hasUnlock =
      proposal.strategyDetail && proposal.unlockCost !== undefined;

    const applyRes = await apiCall(
      "POST",
      "/jobpost/apply-job-post/apply",
      {
        token: expert.token,
        body: {
          expertApplyRequest: {
            jobPostId: jobPost.id,
            expertCode: expert.code,
            proposedBudget: proposal.proposedBudget,
            estimatedDays: proposal.estimatedDays,
          },
          proposalRequest: {
            title: proposal.title,
            strategySummary: proposal.strategySummary,
          },
          proposalUnlockRequest: hasUnlock
            ? {
                strategyDetail: proposal.strategyDetail,
                unlockCost: proposal.unlockCost,
              }
            : undefined,
        },
      },
    );
    if (!applyRes.ok) {
      console.error(
        `[ERR] apply ${e.label}`,
        applyRes.status,
        applyRes.data,
      );
      continue;
    }
    console.log(`  - ${e.label} apply OK`);
  }

  // 6. Lan hire Nam
  console.log("\n[6/6] Lan hire Nam");
  const applies = await apiCall(
    "GET",
    `/jobpost/apply-job-post/${jobPost.id}/applies`,
    { token: lan.token },
  );
  if (!applies.ok) {
    console.error("[ERR] list applies", applies.status, applies.data);
    throw new Error("List applies failed");
  }
  const list = applies.data?.result ?? [];
  const namCode = expertMap.Nam.code;
  const namApply = list.find(
    (a) => a?.expertApply?.expertCode === namCode,
  );
  if (!namApply) {
    console.error(
      "[ERR] Không tìm thấy apply của Nam. Applies:",
      JSON.stringify(list, null, 2),
    );
    throw new Error("Nam apply not found");
  }
  const namApplyId = namApply.expertApply.id;

  const hireRes = await apiCall(
    "POST",
    `/jobpost/job-posts/${jobPost.id}/expert-applies/${namApplyId}/hire`,
    { token: lan.token },
  );
  if (!hireRes.ok) {
    console.error("[ERR] hire", hireRes.status, hireRes.data);
    throw new Error("Hire failed");
  }
  const hire = hireRes.data?.result ?? hireRes.data;
  console.log(`      OK -> workspaceId=${hire?.workspaceId ?? "?"}`);

  console.log("\n>>> DONE\n");
  console.log("Tài khoản đã tạo:");
  console.log(`  Client Lan   : ${CLIENT.email} / ${PASSWORD}`);
  for (const e of EXPERTS) {
    console.log(`  Expert ${e.label.padEnd(5)}: ${e.email} / ${PASSWORD}`);
  }
  console.log(`\nJobPost id   : ${jobPost.id}`);
  console.log(`Workspace id : ${hire?.workspaceId ?? "(check BE)"}`);
}

main().catch((err) => {
  console.error("\n[FATAL]", err.message);
  process.exit(1);
});
