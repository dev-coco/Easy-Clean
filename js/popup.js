const cleanCache = document.getElementById('cleanCache')
const settings = document.getElementById('settings')
const status = document.getElementById('status')

// 打开设置界面
settings.addEventListener('click', () => {
  chrome.tabs.create({ url: '/html/settings.html' })
})

let json
// 初始化界面
async function init () {
  try {
    json = await fetch(`/_locales/${navigator.language.replace('-', '_')}/messages.json`).then(response => response.json())
  } catch {
    json = await fetch('/_locales/en/messages.json').then(response => response.json())
  }
  const elements = document.querySelectorAll('[for]')
  for (const el of elements) {
    el.innerText = json[el.getAttribute('for')].message
  }
}
init()

// 默认保留 Cookies 清单
const defaultBypassList = [
  'facebook.com',
  'instagram.com',
  'messenger.com',
  'twitter.com',
  'whatsapp.com'
]

let process = false
cleanCache.addEventListener('click', async () => {
  // 防止未执行完重复点击
  if (process) return
  process = true
  status.innerText = json.cleaningCache.message
  const settingsList = ['deleteHistory', 'deleteCache', 'deleteDownloads', 'deleteCookies', 'deletePasswords', 'deleteFormData', 'deleteFileSystems', 'deleteAppCache', 'deleteIndexedDB', 'deleteLocalStorage', 'deleteWebSQL', 'deleteServiceWorkers']
  const getSettings = await new Promise(resolve => chrome.storage.local.get(settingsList, data => resolve(data)))
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
      excludeOrigins: bypassList.map(x => 'https://' + x)
      // excludeOrigins: bypassList.map(x => 'https://*.' + x)
    }, { cookies: true })
  }
  chrome.browsingData.remove(options, removeOptions, () => {
    status.innerText = json.cleanCacheFinish.message
    setTimeout(() => {
      status.innerText = json.cleanCache.message
      process = false
    }, 2000)
  })
})
