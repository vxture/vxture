export default function Page() {
  return (
    <div className="vx-page-stack">
      <section className="vx-page-header">
        <div className="vx-page-header__copy">
          <p className="vx-page-header__eyebrow">Admin</p>
          <div className="vx-page-header__title-row">
            <h1>模型接入已迁移</h1>
          </div>
          <p className="vx-page-header__description">
            模型供应商、模型注册、技术授权和成本配置属于平台供给侧能力，已迁移到
            Vxture Admin。
          </p>
        </div>
        <div className="vx-page-header__actions">
          <a
            className="vx-btn vx-btn--default vx-btn--sm"
            href="http://localhost:3030/model-gateway"
          >
            打开 Admin
          </a>
        </div>
      </section>
    </div>
  );
}
