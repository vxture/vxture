/**
 * page.tsx - Vela 独立开发预览页
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category App
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { VelaChat } from "../components/VelaChat";

/**
 * 仅用于开发调试，生产环境由宿主 portal 通过 dynamic import 嵌入。
 * surface 默认 'admin'，可通过 URL 查询参数切换。
 */
export default function VelaPage() {
  return (
    <div className="vx-vela-preview">
      <VelaChat surface="admin" position="sidebar" />
    </div>
  );
}
