import type { ThemeConfig } from 'antd'
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#245bcc',
    borderRadius: 8,
    fontFamily: 'system-ui, sans-serif'
  },
  components: {
    Layout: { headerBg: '#ffffff', siderBg: '#ffffff', bodyBg: '#f4f6fa' }
  }
}
