<template>
  <q-modal v-model="value" ref="modal" content-classes="preview-modal" maximized>
    <q-btn
      color="primary"
      @click.native="print()"
      label="Print"
      style="position: fixed; top: 30px; left: 30px; z-index: 1000;"
      size="sm"
      v-if="!$q.platform.is.mobile || $q.platform.is.ipad"
    />
    <q-btn
      color="primary"
      @click.native="$emit('input', false)"
      icon="fas fa-times"
      style="position: fixed; top: 30px; right: 30px; z-index: 1000;"
      size="sm"
    />
    <div class="row gutter-sm justify-center" id="print-preview" v-if="value">
      <div class="col-12 col-md-10">
        <h3>{{ document.title }}</h3>
        <hr/>
        <div class="q-title">{{ document.mainIdea }}</div>
        <br/>
      </div>
      <!-- Before -->
      <div class="col-12 col-md-10" v-if="structure && document.prefs.hook">
        <preview-section id="hook" :data="structure.hook" :document="document" :modules="modules" :content-type="type" :contentid="id" class="section-preview" />
      </div>
      <div class="col-12 col-md-10" v-if="structure && document.prefs.bible">
        <preview-section id="bible" :document="document" :content-type="type" :contentid="id" class="section-preview" />
      </div>
      <!-- Sections -->
      <div class="col-12 col-md-10" v-if="document.sectionOrder && document.sectionOrder.length > 0 && Object.keys(sections).length > 0">
        <preview-section v-for="orderIndex in document.sectionOrder" :key="orderIndex" :id="orderIndex" :document="document" :data="sections[orderIndex]" :modules="modules" :content-type="type" :contentid="id" class="section-preview" />
      </div>
      <!-- Modules -->
      <!-- <div class="col-12" v-if="modules.length > 0">
        <component v-for="mod in modules" :key="mod['.key']" v-bind:is="'preview-' + mod.type" :id="mod['.key']" :data="mod" class="module-preview" />
      </q-modal> -->
      <!-- After -->
      <div class="col-12 col-md-10">
        <preview-application v-if="structure && document.prefs.application" id="application" :data="structure.application" class="section-preview"  />
        <preview-prayer v-if="structure && document.prefs.prayer" id="prayer" :data="structure.prayer" class="section-preview"  />
      </div>
    </div>
  </q-modal>
</template>

<script>
import PreviewSection from 'components/preview/Section.vue'
// import PreviewQuote from 'components/preview/Quote.vue'
// import PreviewText from 'components/preview/Text.vue'
// import PreviewBible from 'components/preview/Bible.vue'
// import PreviewActivity from 'components/preview/Activity.vue'
// import PreviewQuestion from 'components/preview/Question.vue'
// import PreviewVideo from 'components/preview/Video.vue'
// import PreviewImage from 'components/preview/Image.vue'
// import PreviewLyric from 'components/preview/Lyric.vue'
// import PreviewIllustration from 'components/preview/Illustration.vue'
import PreviewApplication from 'components/preview/Application.vue'
import PreviewPrayer from 'components/preview/Prayer.vue'

export default {
  components: {
    PreviewSection,
    // PreviewQuote,
    // PreviewText,
    // PreviewBible,
    // PreviewActivity,
    // PreviewQuestion,
    // PreviewVideo,
    // PreviewImage,
    // PreviewLyric,
    // PreviewIllustration,
    PreviewApplication,
    PreviewPrayer
  },
  name: 'ContentPreview',
  props: ['value', 'type', 'id', 'sections', 'modules', 'structure', 'document'],
  data () {
    return {
    }
  },
  methods: {
    print () {
      this.$pdf.save({ document: this.document, modules: this.modules, sections: this.sections, structure: this.structure }, this.$firebase.auth.currentUser.displayName, this.$root.$children[0].user)
      // const currentTheme = this.$root.$children[0].user.app.prefs.theme
      // // this.$root.$children[0].user.app.prefs.theme = 'light'
      // this.$nextTick(() => {
      //   // window.print()
      //   // this.$pdf.save(document.getElementById('previewContent'), this.document.title)
      //   // this.$pdf.save(this.printDiv('previewContent', this.document.title), this.document.title)
      //   // console.log('html', document.getElementById('previewContent').innerHTML)
      //   this.$root.$children[0].user.app.prefs.theme = currentTheme
      // })
    },
    printDiv (id, title) {
      let mywindow = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150')

      var css = []
      for (var sheeti = 0; sheeti < document.styleSheets.length; sheeti++) {
        var sheet = document.styleSheets[sheeti]
        if (sheet.href === null) {
          var rules = ('cssRules' in sheet) ? sheet.cssRules : ('rules' in sheet) ? sheet.rules : []
          for (var rulei = 0; rulei < rules.length; rulei++) {
            var rule = rules[rulei]
            if ('cssText' in rule) {
              css.push(rule.cssText)
            } else {
              css.push(rule.selectorText + ' {\n' + rule.style.cssText + '\n}\n')
            }
          }
        }
      }

      mywindow.document.write(`<html><head><title>${title}</title>`)
      mywindow.document.write(`<style type="text/css">${css.join('\n')}</style>`)
      mywindow.document.write('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">')
      mywindow.document.write('</head><body>')
      mywindow.document.write(document.getElementById(id).innerHTML)
      mywindow.document.write('</body></html>')

      var html = `<html><head><title>${title}</title><style type="text/css">${css.join('\n')}</style><link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous"></head><body>${document.getElementById(id).innerHTML}</body></html>`
      // mywindow.document.close()
      // mywindow.focus()

      // mywindow.print()
      // mywindow.close()

      return html
    }
  }
}
</script>

<style>

.preview-modal {
  padding: 40px 10px;
  width: 100%;
  overflow-x: hidden;
}

.module-preview {
  margin-bottom: 20px;
}

.section-preview {
  margin-bottom: 20px;
  background-color: inherit;
  /* border: 2px dashed var(--q-color-primary); */
}

</style>
