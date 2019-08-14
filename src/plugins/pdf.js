var pdfMake = require('pdfmake/build/pdfmake.js')
var pdfFonts = require('pdfmake/build/vfs_fonts.js')
pdfMake.vfs = pdfFonts.pdfMake.vfs
// import * as JSPDF from 'jspdf'

import firebase from 'firebase/app'
import 'firebase/firestore'

import * as bible from './bible'

// var fa = require('@fortawesome/fontawesome-free')
// console.log(fa)

pdfMake.vfs.fontawesome = require('./fa.json').fa

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  fontawesome: {
    normal: 'fontawesome',
    bold: 'fontawesome',
    italics: 'fontawesome',
    bolditalics: 'fontawesome'
  }
}

var findSymbolForClass = function (selector) {
  var result = ''
  var sheets = document.styleSheets

  for (var sheetNr = 0; sheetNr < sheets.length; sheetNr++) {
    var content = findCSSRuleContent(sheets[sheetNr], selector)

    if (content) {
      result = stripQuotes(content)
      break
    }
  }
  return result
}

function findCSSRuleContent (mySheet, selector) {
  var ruleContent = ''
  var rules = mySheet.cssRules ? mySheet.cssRules : mySheet.rules

  for (var i = 0; i < rules.length; i++) {
    var text = rules[i].selectorText
    if (text && text.indexOf(selector) >= 0) {
      ruleContent = rules[i].style.content
      break
    }
  }

  return ruleContent
}

function stripQuotes (string) {
  var len = string.length
  return string.slice(1, len - 1)
}

function convertImgToBase64URL (url, callback, outputFormat) {
  var img = new Image()
  img.setAttribute('crossOrigin', 'anonymous')
  img.onload = function () {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var dataURL
    canvas.height = this.height
    canvas.width = this.width
    ctx.drawImage(img, 0, 0)
    dataURL = canvas.toDataURL(outputFormat)
    callback(dataURL)
    canvas = null
  }
  img.src = url
}

function evalMedia (mod) {
  console.log('eval media', mod)
  return new Promise(async (resolve) => {
    const media = (await firebase.firestore().collection(`message${mod.type.charAt(0).toUpperCase()}${mod.type.substr(1)}`).doc(mod.mediaid).get()).data()
    switch (mod.type) {
      case 'quote':
        resolve({
          columns: [
            // Icon
            {
              width: 30,
              text: findSymbolForClass('fa-quote-left', ''),
              style: 'icon'
            },
            {
              stack: [
                // Text
                {
                  text: media.text,
                  style: 'quoteText'
                },
                // Author - Book
                {
                  text: `${media.title} | ${media.author}`,
                  style: 'quoteMeta'
                }
              ]
            }
          ],
          columnGap: 10,
          style: 'module'
        })
        break
      case 'image':
        convertImgToBase64URL(media.imageURL, (base64) => {
          resolve({
            stack: [
              // Image
              {
                image: `data:image/jpeg;base64,${base64}`
              }
            ],
            columnGap: 10,
            style: 'module'
          })
        })
        break
      case 'lyric':
        resolve({
          columns: [
            // Icon
            {
              width: 30,
              text: findSymbolForClass('fa-note', ''),
              style: 'icon'
            },
            {
              stack: [
                // Text
                {
                  text: media.title,
                  style: 'moduleTitle',
                  headlineLevel: 2
                },
                // Author - Book
                {
                  text: media.text,
                  style: 'normalText'
                }
              ]
            }
          ],
          columnGap: 10,
          style: 'module'
        })
        break
      case 'video':
        resolve({
          columns: [
            // Icon
            {
              width: 30,
              text: findSymbolForClass('fa-video', ''),
              style: 'icon'
            },
            {
              stack: [
                // Title
                {
                  text: media.title,
                  style: 'moduleTitle',
                  headlineLevel: 2
                },
                // Author
                {
                  text: media.author,
                  style: 'normalText'
                },
                // URL
                {
                  text: media.pageURL,
                  style: 'normalText'
                }
              ]
            }
          ],
          columnGap: 10,
          style: 'module'
        })
        break
      case 'illustration':
        resolve({
          columns: [
            // Icon
            {
              width: 30,
              text: findSymbolForClass('fa-paint-brush', ''),
              style: 'icon'
            },
            {
              stack: [
                // Title
                {
                  text: media.title,
                  style: 'moduleTitle',
                  headlineLevel: 2
                },
                // Text
                {
                  text: media.text,
                  style: 'normalText'
                }
              ]
            }
          ],
          columnGap: 10,
          style: 'module'
        })
    }
  })
}

async function evalMod (mod, doc) {
  var result = []
  switch (mod.type) {
    case 'text':
      result.push({
        stack: [
          // Title
          {
            text: mod.title,
            style: 'moduleTitle',
            headlineLevel: 2
          },
          // Text
          {
            text: stripHtml(mod.text),
            style: 'normalText'
          }
        ],
        style: 'module'
      })
      return result
    case 'bible':
      // Bible Text
      result.push({
        columns: [
          {
            width: 30,
            text: findSymbolForClass('fa-book', ''),
            style: 'icon'
          },
          {
            stack: [
              // Text
              {
                text: mod.text,
                style: 'bibleText'
              },
              // Ref
              {
                text: `${bible.readable(mod.bibleRef)} (${mod.translation})`,
                style: 'bibleRef'
              }
            ]
          }
        ],
        columnGap: 10,
        style: 'module'
      })
      return result
    case 'bullet':
      // Ordered / Unordered
      var tmpBullet = {}
      tmpBullet[mod.ordered ? 'ol' : 'ul'] = mod.list
      result.push({
        stack: [
          // Title
          {
            text: mod.title,
            style: 'moduleTitle',
            headlineLevel: 2
          },
          // Bullets
          {
            ...tmpBullet,
            style: 'module'
          }
        ],
        style: 'module'
      })
      return result
    case 'activity':
      result.push({
        columns: [
          // Icon
          {
            width: 30,
            text: findSymbolForClass('fa-trophy', ''),
            style: 'icon'
          },
          {
            stack: [
              // Title
              {
                text: mod.title,
                style: 'moduleTitle',
                headlineLevel: 2
              },
              // Text
              {
                text: stripHtml(mod.text),
                style: 'normalText'
              },
              // Equipment
              {
                ul: mod.equipment,
                style: 'moduleBullet'
              }
            ]
          }
        ],
        columnGap: 10,
        style: 'module'
      })
      return result
    case 'question':
      result.push({
        columns: [
          // Icon
          {
            width: 30,
            text: findSymbolForClass('fa-question', ''),
            style: 'icon'
          },
          {
            stack: [
              // Text
              {
                text: mod.question,
                style: 'questionText'
              },
              // Notes
              {
                text: mod.notes,
                style: 'notesText'
              }
            ]
          }
        ],
        columnGap: 10,
        style: 'module'
      })
      return result
    case 'mainidea':
      result.push({
        columns: [
          // Icon
          {
            width: 30,
            text: findSymbolForClass('fa-lightbulb', ''),
            style: 'icon'
          },
          {
            stack: [
              // Title
              {
                text: 'Main Idea',
                style: 'moduleTitle',
                headlineLevel: 2
              },
              // Author - Book
              {
                text: doc.mainidea,
                style: 'normalText'
              }
            ]
          }
        ],
        columnGap: 10,
        style: 'module'
      })
      return result
    case 'image':
    case 'video':
    case 'quote':
    case 'illustration':
    case 'lyric':
      return evalMedia(mod)
  }
}

async function buildSection (section, modules, doc) {
  var result = []
  console.log('section', section)
  result.push({
    text: section.title,
    style: 'sectionHeader',
    headlineLevel: 1
  })
  result.push({
    canvas: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        w: 500,
        h: 0,
        r: 5,
        lineWidth: 1,
        lineColor: '#246EB9'
      }
    ],
    margin: [0, 0, 0, 20]
  })
  var evalMods = [].concat.apply([], await Promise.all(section.moduleOrder.map(e => {
    return evalMod(modules[e], doc)
  })))
  result.push(evalMods)
  console.log('sectionMods', result)
  return result
}

async function buildBible (doc, version, title) {
  var result = []
  result.push({
    text: title,
    style: 'sectionHeader',
    headlineLevel: 1
  })
  result.push({
    canvas: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        w: 500,
        h: 0,
        r: 5,
        lineWidth: 1,
        lineColor: '#246EB9'
      }
    ],
    margin: [0, 0, 0, 20]
  })
  return Promise.all(doc.bibleRefs.map(ref => bible.text(ref, version))).then((res) => {
    doc.bibleRefs.forEach((ref, index) => {
      // Bible Text
      result.push({
        columns: [
          {
            width: 30,
            text: findSymbolForClass('fa-book', ''),
            style: 'icon'
          },
          {
            stack: [
              {
                text: res[index],
                style: 'bibleText'
              },
              {
                text: `${bible.readable(ref)} (${version})`,
                style: 'bibleRef'
              }
            ]
          }
        ],
        columnGap: 10,
        style: 'module'
      })
    })
    console.log('bible result', result)
    return result
  })
}

function buildApp (section, title) {
  var result = []
  result.push({
    text: title,
    style: 'sectionHeader',
    headlineLevel: 1
  })
  result.push({
    canvas: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        w: 500,
        h: 0,
        r: 5,
        lineWidth: 1,
        lineColor: '#246EB9'
      }
    ],
    margin: [0, 0, 0, 20]
  })
  if (section.thought !== '') {
    result.push({
      stack: [{
        text: 'Thought',
        style: 'moduleTitle',
        headlineLevel: 2
      },
      {
        text: section.thought,
        style: 'normalText'
      }],
      style: 'module'
    })
  }
  if (section.today !== '') {
    result.push({
      stack: [{
        text: 'Today',
        style: 'moduleTitle',
        headlineLevel: 2
      },
      {
        text: section.today,
        style: 'normalText'
      }],
      style: 'module'
    })
  }
  if (section.thisweek !== '') {
    result.push({
      stack: [{
        text: 'This Week',
        style: 'moduleTitle',
        headlineLevel: 2
      },
      {
        text: section.thisweek,
        style: 'normalText'
      }],
      style: 'module'
    })
  }
  return result
}

function buildPrayer (section, title) {
  if (section.text !== '') {
    var result = []
    result.push({
      text: title,
      style: 'sectionHeader',
      headlineLevel: 1
    })
    result.push({
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: 500,
          h: 0,
          r: 5,
          lineWidth: 1,
          lineColor: '#246EB9'
        }
      ],
      margin: [0, 0, 0, 20]
    })
    result.push({
      stack: [{
        text: stripHtml(section.text),
        style: 'normalText'
      }],
      style: 'module'
    })
    return result
  } else {
    return []
  }
}

async function savePDF ({ document, modules, sections, structure }, username, user) {
  console.log('document', document)
  var content = []

  // Message Title
  content.push({
    text: document.title,
    style: 'title'
  })

  // Message Author
  content.push({
    text: username,
    alignment: 'right'
  })

  // Message Main Idea
  content.push({
    text: 'Main Idea',
    style: 'sectionHeader',
    headlineLevel: 1
  })
  content.push({
    canvas: [
      {
        type: 'rect',
        x: 0,
        y: 0,
        w: 500,
        h: 0,
        r: 5,
        lineWidth: 1,
        lineColor: '#246EB9'
      }
    ],
    margin: [0, 0, 0, 20]
  })
  content.push({
    text: document.mainIdea,
    fontSize: 16,
    margin: [0, 0, 0, 30]
  })

  if (document.prefs.hook) {
    content.push(await buildSection({ ...structure.hook, title: user.app.message.prefs.structureNames.hook }, modules, document))
  }

  if (document.prefs.bible) {
    var bibleContent = await buildBible(document, user.app.prefs.bibleTranslation, user.app.message.prefs.structureNames.bible)
    content.push(bibleContent)
  }

  content.push(await Promise.all(document.sectionOrder.map(e => {
    return buildSection(sections[e], modules, document)
  })))

  if (document.prefs.application) {
    content.push(buildApp(structure.application, user.app.message.prefs.structureNames.application))
  }

  if (document.prefs.prayer) {
    content.push(buildPrayer(structure.prayer, user.app.message.prefs.structureNames.prayer))
  }

  var docDefinition = {
    info: {
      title: document.title,
      author: username,
      keywords: document.tags.join(',')
    },
    header: function (currentPage) {
      return [
        {
          text: currentPage === 1 ? '' : `${document.title} | ${username}`,
          margin: [40, 20, 0, 0],
          color: '#5C5D5C'
        }
      ]
    },
    footer: function (currentPage, pageCount) {
      return [
        {
          text: currentPage.toString() + ' of ' + pageCount,
          alignment: 'right',
          margin: [40, 0, 40, 0],
          color: '#5C5D5C'
        }
      ]
    },
    content,
    defaultStyle: {
    },
    styles: {
      icon: {
        font: 'fontawesome',
        fontSize: 30,
        color: '#246EB9'
      },
      title: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      author: {
        fontSize: 12,
        italics: true,
        margin: [40, 20]
      },
      sectionHeader: {
        fontSize: 18,
        bold: true
      },
      moduleTitle: {
        fontSize: 14,
        italics: true,
        margin: [0, 0, 0, 10],
        headlineLevel: 2
      },
      module: {
        margin: [0, 0, 0, 20]
      },
      normalText: {
        fontSize: 12,
        margin: [0, 0, 0, 10]
      },
      questionText: {
        fontSize: 12,
        italics: true
      },
      notesText: {
        fontsize: 8,
        margin: [0, 0, 0, 10]
      },
      quoteText: {
        fontSize: 12,
        italics: true,
        margin: [0, 0, 0, 10]
      },
      quoteMeta: {
        fontSize: 8,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      bibleText: {
        italics: true
      },
      bibleRef: {
        fontSize: 10,
        alignment: 'right'
      }
    },
    pageSize: 'LETTER',
    pageMargins: [ 40, 60 ],
    pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
      console.log('pgbrk', currentNode, currentNode.headlineLevel, followingNodesOnPage)
      // return currentNode.headlineLevel === 1 && !followingNodesOnPage.map(e => e.headlineLevel).includes(1) && nodesOnNextPage.length > 0
      return (currentNode.headlineLevel === 1 || currentNode.headlineLevel === 2) && followingNodesOnPage.length === 4 && nodesOnNextPage.length > 0
    }
  }

  pdfMake.createPdf(docDefinition).open()
}

function stripHtml (html) {
  var temporalDiv = document.createElement('div')
  temporalDiv.innerHTML = html
  return temporalDiv.textContent || temporalDiv.innerText || ''
}

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.prototype.$pdf = {
    save: savePDF
  }
}
