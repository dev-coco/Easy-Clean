chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') chrome.tabs.create({url: `https://dev-coco.github.io/post/Easy-Clean${navigator.language.substring(0, 2) === 'zh' ? '' : '-EN'
}/` })
})

// 默认保留 Cookies 清单
const defaultBypassList = [
  'facebook.com',
  'instagram.com',
  'messenger.com',
  'twitter.com',
  'whatsapp.com'
]

chrome.windows.onRemoved.addListener(() => {
  chrome.windows.getAll({}, async windows => {
    const windowCount = windows.length
    // 检测是否关闭所有窗口
    if (windowCount < 1) cleanCache()
  })
})

// 启动后清理缓存
chrome.runtime.onStartup.addListener(cleanCache)

async function cleanCache () {
  const settingsList = ['deleteHistory', 'deleteCache', 'deleteDownloads', 'deleteCookies', 'deletePasswords', 'deleteFormData', 'deleteFileSystems', 'deleteAppCache', 'deleteIndexedDB', 'deleteLocalStorage', 'deleteWebSQL', 'deleteServiceWorkers', 'autoClean']
  const getSettings = await new Promise(resolve => chrome.storage.local.get(settingsList, data => resolve(data)))
  // 判断是否开启
  if (getSettings.autoClean === false) return
  const options = {
    since: 0,
    originTypes: {
      unprotectedWeb: true,
      protectedWeb: true,
    }
  }
  const removeOptions = {}
  if (getSettings.deleteHistory || getSettings.deleteHistory === undefined) removeOptions.history = true
  if (getSettings.deleteCache || getSettings.deleteCache === undefined) removeOptions.cache = true
  if (getSettings.deleteDownloads || getSettings.deleteDownloads === undefined) removeOptions.downloads = true
  if (getSettings.deletePasswords || getSettings.deletePasswords === undefined) removeOptions.passwords = true
  if (getSettings.deleteFormData || getSettings.deleteFormData === undefined) removeOptions.formData = true
  if (getSettings.deleteFileSystems || getSettings.deleteFileSystems === undefined) removeOptions.fileSystems = true
  if (getSettings.deleteAppCache || getSettings.deleteAppCache === undefined) removeOptions.appcache = true
  if (getSettings.deleteIndexedDB || getSettings.deleteIndexedDB === undefined) removeOptions.indexedDB = true
  if (getSettings.deleteLocalStorage || getSettings.deleteLocalStorage === undefined) removeOptions.localStorage = true
  if (getSettings.deleteWebSQL || getSettings.deleteWebSQL === undefined) removeOptions.webSQL = true
  if (getSettings.deleteServiceWorkers || getSettings.deleteServiceWorkers === undefined) removeOptions.serviceWorkers = true

  if (getSettings.deleteCookies || getSettings.deleteCookies === undefined) {
    const bypassList = await new Promise(resolve => chrome.storage.local.get('bypassList', result => resolve(result.bypassList))) || defaultBypassList
    await chrome.browsingData.remove({
      since: 0,
      excludeOrigins: bypassList.map(url => 'https://*.' + url)
    }, { cookies: true })
  }
  chrome.browsingData.remove(options, removeOptions)
}
