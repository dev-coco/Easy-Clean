// 删除的 Cookies 全选
const checkAllLeft = document.getElementsByClassName('check-all-left')[0]
checkAllLeft.addEventListener('click', e => {
  [...document.getElementsByClassName('remove-cookie')].map(x => x.checked = e.target.checked)
})

// 保留的 Cookies 全选
const checkAllRight = document.getElementsByClassName('check-all-right')[0]
checkAllRight.addEventListener('click', e => {
  [...document.getElementsByClassName('bypass-cookie')].map(x => x.checked = e.target.checked)
})

// 默认保留 Cookies 清单
const defaultBypassList = [
  'facebook.com',
  'instagram.com',
  'messenger.com',
  'twitter.com',
  'whatsapp.com'
]

// 移至保留的 Cookies
const toBypassCookie = document.getElementById('toBypassCookie')
toBypassCookie.addEventListener('click', async () => {
  // 获取删除 Cookies 勾选项目
  const checkedList = document.querySelectorAll('.remove-cookie:checked')
  // 获取保留的 Cookies 清单
  const bypassList = await new Promise(resolve => chrome.storage.local.get('bypassList', result => resolve(result.bypassList))) || defaultBypassList
  for (const info of checkedList) bypassList.push(info.dataset.domain)
  // 储存数据
  chrome.storage.local.set({ bypassList })
  // 重新渲染清单
  updateCookiesDomin()
})

// 移至删除的 Cookies
const toRemoveCookie = document.getElementById('toRemoveCookie')
toRemoveCookie.addEventListener('click', async () => {
  // 获取保留的 Cookies 未勾选项目
  const checkedList = document.querySelectorAll('.bypass-cookie:not(:checked)')
  const arr = []
  for (const info of checkedList) arr.push(info.dataset.domain)
  // 储存数据
  chrome.storage.local.set({ bypassList: arr })
  // 重新渲染清单
  updateCookiesDomin()
})

// 获取包含 Cookies 的域名
async function cookiesDomain () {
  const arr = []
  // 排除的清单，如果没有就从使用默认配置
  const bypassList = await new Promise(resolve => chrome.storage.local.get('bypassList', result => resolve(result.bypassList))) || defaultBypassList
  // 获取所有 Cookies
  const allCookies = await new Promise(resolve => chrome.cookies.getAll({}, cookies => resolve(cookies)))
  for (const x of allCookies) arr.push(x.domain.replace(/^\./g, ''))
  // 排除保留 Cookies 的域名
  return Array.from(new Set(arr)).filter(item => !bypassList.includes(item))
}

const removeCookieList = document.getElementsByClassName('remove-cookie-list')[0]
const bypassCookieList = document.getElementsByClassName('bypass-cookie-list')[0]

// 初始化
async function init () {
  let json
  try {
    json = await fetch(`/_locales/${navigator.language.replace('-', '_')}/messages.json`).then(response => response.json())
  } catch {
    json = await fetch('/_locales/en/messages.json').then(response => response.json())
  }
  // 获取字符元素，写入对应语言的字符
  const elements = document.querySelectorAll('[for]')
  for (const el of elements) {
    console.log(el.getAttribute('for'))
    el.innerText = json[el.getAttribute('for')].message
  }
  const settingsList = ['deleteHistory', 'deleteCache', 'deleteDownloads', 'deleteCookies', 'deletePasswords', 'deleteFormData', 'deleteFileSystems', 'deleteAppCache', 'deleteIndexedDB', 'deleteLocalStorage', 'deleteWebSQL', 'deleteServiceWorkers', 'autoClean']
  // 默认全部启用
  chrome.storage.local.get(settingsList, (data) => {
    for (let i = 0; i < settingsList.length; i++) {
      const param = data[settingsList[i]]
      document.getElementById(settingsList[i]).checked = (void 0 === param || param || !1)
    }
  })
  updateCookiesDomin()
}
init()

// 渲染清单
async function updateCookiesDomin () {
  const bypassList = await new Promise(resolve => chrome.storage.local.get('bypassList', result => resolve(result.bypassList))) || defaultBypassList
  const removeList = await cookiesDomain()
  let bypassHtml = ''
  let removeHtml = ''
  for (let i = 0; i < bypassList.length; i++) {
    bypassHtml += `<div class="mt-1 mb-2"><input class="form-check-input bypass-cookie" type="checkbox" id="bypass${i + 1}" data-domain="${bypassList[i]}"><label for="bypass${i + 1}">${bypassList[i]}</label></div>`
  }
  for (let i = 0; i < removeList.length; i++) {
    removeHtml += `<div class="mt-1 mb-2"><input class="form-check-input remove-cookie" type="checkbox" id="remove${i + 1}" data-domain="${removeList[i]}"><label for="remove${i + 1}">${removeList[i]}</label></div>`
  }
  removeCookieList.innerHTML = removeHtml
  bypassCookieList.innerHTML = bypassHtml
}

// 监听设置变化
const inputList = document.querySelectorAll('input:not([data-domain])')
inputList.forEach(input => {
  input.addEventListener('change', event => {
    // 储存设置
    chrome.storage.local.set({ [event.target.id]: event.target.checked })
  })
})
