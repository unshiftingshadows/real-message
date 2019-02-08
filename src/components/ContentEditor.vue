<template>
  <div>
    <div v-if="loading">
      <q-spinner color="primary" class="absolute-center" size="3rem" />
    </div>
    <div v-if="!loading" class="row gutter-sm">
      <!-- Before -->
      <div class="col-12" v-if="structure.hook && document.prefs.hook">
        <module-section id="hook" :data="structure.hook" :modules="modules" :onChange="onChangeMod" :content-type="type" :contentid="id" @edit="editModule" @save="saveModule" @autosave="autoSaveModule" @close="closeModule" @remove="removeModule" class="section-card" />
      </div>
      <!-- Sections -->
      <div class="col-12" v-if="document && document.sectionOrder && document.sectionOrder.length > 0 && Object.keys(sections).length > 0">
        <draggable :list="document.sectionOrder" @start="drag=true" @change="onSectionDrag" ref="sectionDrag" :options="{ group: 'sections', disabled: $q.platform.is.mobile }">
          <module-section v-for="orderIndex in document.sectionOrder" :key="orderIndex" :id="orderIndex" :data="sections[orderIndex]" :modules="modules" :onChange="onChangeMod" :content-type="type" :contentid="id" :edit="editSection" :remove="removeSection" @edit="editModule" @save="saveModule" @autosave="autoSaveModule" @close="closeModule" @remove="removeModule" class="section-card" />
        </draggable>
      </div>
      <add-section :add-section="addSection" :close="closeModule" />
      <!-- Modules -->
      <!-- <div class="col-12" v-if="modules.length > 0">
        <draggable :list="modules" @start="drag=true" ref="indModuleDrag" :options="{ group: { name: 'modules', pull: 'clone' }, handle: '.drag-handle', disabled: editingid !== '' || ($q.platform.is.mobile && !$q.platform.is.ipad) }">
          <component v-for="mod in modules" :key="mod['.key']" v-bind:is="'mod-' + mod.type" :id="mod['.key']" :data="mod" class="module-card" :edit="editModule" :save="saveModule" :autosave="autoSaveModule" :close="closeModule" :remove="removeModule" v-bind:class="{ 'active-card': mod.editing === $firebase.auth.currentUser.uid }" />
        </draggable>
      </div> -->
      <!-- After -->
      <div class="col-12">
        <mod-application v-if="structure.application && document.prefs.application" id="application" :data="structure.application" :edit="editModule" :save="saveModule" :autosave="autoSaveModule" :close="closeModule" :remove="removeModule" class="module-card" v-bind:class="{ 'active-card': structure.application.editing === $firebase.auth.currentUser.uid }" />
        <mod-prayer v-if="structure.prayer && document.prefs.prayer" id="prayer" :data="structure.prayer" :edit="editModule" :save="saveModule" :autosave="autoSaveModule" :close="closeModule" :remove="removeModule" class="module-card" v-bind:class="{ 'active-card': structure.prayer.editing === $firebase.auth.currentUser.uid }" />
      </div>
    </div>
    <q-modal ref="addNewModule" content-classes="add-module-modal">
      <div class="row gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            @click.native="cancelModule"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h4>Choose Section</h4>
        </div>
        <div class="col-12">
          <q-select
            v-model="sectionChoice"
            float-label="Choose Section to Add Module"
            :options="sectionOptions"
          />
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="addModule(sectionChoice, false)">Save</q-btn>
        </div>
      </div>
    </q-modal>
    <content-preview v-model="preview" :type="type" :id="id" :sections="sections" :modules="modules" :structure="structure" :document="document" />
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import AddModule from 'components/AddModule.vue'
import AddSection from 'components/AddSection.vue'
import ModApplication from 'components/modules/Application.vue'
import ModPrayer from 'components/modules/Prayer.vue'
import ModuleSection from 'components/ModuleSection.vue'
import ContentPreview from 'components/ContentPreview.vue'

export default {
  components: {
    Draggable,
    AddModule,
    AddSection,
    ModApplication,
    ModPrayer,
    ModuleSection,
    ContentPreview
  },
  name: 'ContentEditor',
  props: ['type', 'id'],
  fiery: true,
  data () {
    return {
      contentTypes: ['text', 'bible', 'activity', 'question'],
      mediaTypes: ['quote', 'image', 'video', 'lyric', 'illustration'],
      loading: true,
      initRun: true,
      drag: false,
      editingid: '',
      editingSection: undefined,
      sectionChoice: '',
      tempModule: false,
      preview: false,
      document: this.$fiery(this.$firebase.ref('message', '', this.id), {
        include: ['sectionOrder']
      }),
      structure: this.$fiery(this.$firebase.ref('message', 'structure', this.id), {
        map: true
      }),
      sections: this.$fiery(this.$firebase.ref('message', 'sections', this.id), {
        map: true
      }),
      modules: this.$fiery(this.$firebase.ref('message', 'modules', this.id), {
        map: true,
        onSuccess: (modules) => {
          this.loading = false
          if (this.initRun) {
            this.initRun = false
            for (var mod in modules) {
              if (modules[mod].editing === this.$firebase.auth.currentUser.uid) {
                this.closeModule(mod)
              }
            }
          }
        }
      }),
      versions: this.$fiery(this.$firebase.ref('message', 'versions', this.id))
    }
  },
  watch: {
    'tempModule': function (val) {
      console.log('tempModule watch')
      if (val !== false) {
        console.log('tempModule not empty', val)
        if (val.sectionid) {
          this.addModule(val.sectionid, this.contentTypes.includes(val.data.type))
        } else if (this.document.sectionOrder.length > 0) {
          console.log('pick section')
          this.$refs.addNewModule.show()
        } else {
          console.log('else add...')
          this.addModule('hook', false)
        }
      } else {
        console.log('tempModule empty', val)
        this.$refs.addNewModule.hide()
      }
    },
    '$q.appVisible': function (val) {
      if (!val && this.editingid !== '') {
        this.closeModule(this.editingid, this.editingSection)
      }
    }
  },
  computed: {
    sectionOptions: function () {
      var options = Object.keys(this.sections).map(e => { return { label: this.sections[e].title, value: e } })
      options.splice(0, 0, { label: 'Hook', value: 'hook' })
      return options
    }
  },
  mounted () {
    this.$root.$on('add-module', (data, sectionid) => {
      this.$sentry.crumb({
        category: 'module',
        message: `Added external module: ${data.type}`,
        level: 'info'
      })
      console.log('section', sectionid)
      this.tempModule = {
        data: data,
        sectionid: sectionid
      }
    })
    this.$root.$on('preview-document', (data) => {
      console.log('preview!', data)
      if (data === this.id) {
        this.preview = true
      }
    })
  },
  methods: {
    editModule (moduleid, sectionid) {
      if (moduleid === undefined || moduleid === '') {
        return
      }
      console.log('edit module', moduleid, sectionid)
      if (this.editingid !== moduleid && this.editingid !== '') {
        console.log('close module before edit')
        this.closeModule(this.editingid, this.editingSection)
      }
      this.editingid = moduleid
      this.editingSection = sectionid
      if (sectionid) {
        if (sectionid === 'hook') {
          this.structure.hook.editing = this.$firebase.auth.currentUser.uid
          this.$fiery.update(this.structure.hook, ['editing'])
        } else {
          this.sections[sectionid].editing = this.$firebase.auth.currentUser.uid
          this.$fiery.update(this.sections[sectionid], ['editing'])
        }
        this.modules[moduleid].editing = this.$firebase.auth.currentUser.uid
        this.$fiery.update(this.modules[moduleid], ['editing'])
      } else if (moduleid === 'application' || moduleid === 'prayer') {
        this.structure[moduleid].editing = this.$firebase.auth.currentUser.uid
        this.$fiery.update(this.structure[moduleid], ['editing'])
      } else {
        this.modules[moduleid].editing = this.$firebase.auth.currentUser.uid
        this.$fiery.update(this.modules[moduleid], ['editing'])
      }
    },
    autoSaveModule (moduleid, sectionid, text, title) {
      console.log('autosave module', moduleid, sectionid, text, title)
      if (moduleid === 'application' || moduleid === 'prayer') {
        this.structure[moduleid].text = text
        if (title !== undefined) {
          this.structure[moduleid].title = title
        }
        this.$fiery.update(this.structure[moduleid], ['title', 'text'])
      } else {
        if (title !== undefined) {
          this.modules[moduleid].title = title
        }
        this.modules[moduleid].text = text
        this.$fiery.update(this.modules[moduleid], ['title', 'text'])
      }
    },
    saveModule (moduleid, sectionid, data) {
      console.log('save module', moduleid, sectionid, data)
      data.editing = false
      if (data.type === 'text' || data.type === 'bible') {
        data.wordcount = this.getWordCount(data.text)
        data.time = this.getEstTime(data.wordcount)
      }
      console.log('save data', data)
      if (moduleid === 'application' || moduleid === 'prayer') {
        this.$fiery.update(data)
      } else {
        this.$fiery.update(data)
      }
      this.editingid = ''
    },
    closeModule (moduleid, sectionid) {
      console.log('closing', moduleid, sectionid)
      console.log('current', this.editingid, this.editingSection)
      if (moduleid !== undefined && typeof moduleid === 'string') {
        if (moduleid === 'application' || moduleid === 'prayer') {
          this.structure[moduleid].editing = false
          this.$fiery.update(this.structure[moduleid], ['editing'])
        } else {
          this.modules[moduleid].editing = false
          this.$fiery.update(this.modules[moduleid], ['editing'])
        }
      } else if (this.editingid !== '') {
        if (this.editingid === 'application' || this.editingid === 'prayer') {
          this.structure[this.editingid].editing = false
          this.$fiery.update(this.structure[this.editingid], ['editing'])
          this.editingid = ''
          this.editingSection = undefined
        } else {
          this.modules[this.editingid].editing = false
          this.$fiery.update(this.modules[this.editingid], ['editing'])
          this.editingid = ''
          this.editingSection = undefined
        }
      } else {
        console.log('no current module to close')
      }
    },
    removeModule (moduleid, sectionid) {
      console.log('remove module', moduleid, sectionid)
      if (sectionid !== '') {
        if (sectionid === 'hook') {
          this.structure.hook.moduleOrder.splice(this.structure.hook.moduleOrder.indexOf(moduleid), 1)
          this.$fiery.update(this.structure.hook, ['moduleOrder'])
        } else {
          this.sections[sectionid].moduleOrder.splice(this.sections[sectionid].moduleOrder.indexOf(moduleid), 1)
          this.$fiery.update(this.sections[sectionid], ['moduleOrder'])
        }
      }
      this.$fiery.remove(this.modules[moduleid])
      this.$sentry.crumb({
        category: 'module',
        message: `Removed module: ${moduleid}`,
        level: 'info'
      })
      this.editingid = ''
    },
    addModule (sectionid, editing) {
      console.log('adding module', sectionid, this.tempModule.data)
      if (editing) {
        this.tempModule.data.editing = this.$firebase.auth.currentUser.uid
      }
      if (sectionid) {
        this.$fires.modules.add(this.tempModule.data).then((newMod) => {
          if (this.$types.MEDIA.includes(this.tempModule.data.type)) {
            this.$firebase.list(this.tempModule.data.type).doc(this.tempModule.data.mediaid).update({
              used: this.$firebase.base.firestore.FieldValue.arrayUnion({
                message: this.id,
                section: sectionid,
                module: newMod.id
              })
            })
          }
          console.log('saved')
          this.tempModule = false
          this.editingid = newMod.id
          this.editingSection = sectionid
          if (sectionid === 'hook') {
            this.structure.hook.moduleOrder.push(newMod.id)
            this.$fiery.update(this.structure.hook, ['moduleOrder'])
          } else {
            this.sections[sectionid].moduleOrder.push(newMod.id)
            this.$fiery.update(this.sections[sectionid], ['moduleOrder'])
          }
          this.$sentry.crumb({
            category: 'module',
            message: `Added module to section: ${sectionid}`,
            level: 'info'
          })
        })
      } else {
        console.error('cannot add module to unknown section')
      }
    },
    cancelModule () {
      this.tempModule = false
    },
    addSection (title) {
      console.log('adding section', title)
      var obj = {
        title: title,
        static: false,
        editing: false,
        moduleOrder: []
      }
      this.$fires.sections.add(obj).then((newRef) => {
        this.$sentry.crumb({
          category: 'section',
          message: `Added section: ${newRef.id}`,
          level: 'info'
        })
        this.document.sectionOrder.push(newRef.id)
        this.document.modifiedDate = new Date()
        this.document.modifiedBy = this.$firebase.auth.currentUser.uid
        this.$fiery.update(this.document)
      })
    },
    editSection (sectionid, updates) {
      console.log('editing section', sectionid, updates, this.sections)
      for (var update in updates) {
        this.sections[sectionid][update] = updates[update]
      }
      this.$fiery.update(this.sections[sectionid])
    },
    removeSection (sectionid) {
      // * NOTE: This does not remove all subcollections for some reason...modules still exist, even though structure is gone
      console.log('remove section', sectionid)
      // this.$fiery.remove(this.getSectionById(sectionid))
      this.document.sectionOrder.splice(this.document.sectionOrder.indexOf(sectionid), 1)
      this.document.modifiedDate = new Date()
      this.document.modifiedBy = this.$firebase.auth.currentUser.uid
      this.$fiery.update(this.document)
      this.$fiery.remove(this.sections[sectionid])
      this.$sentry.crumb({
        category: 'section',
        message: `Removed section: ${sectionid}`,
        level: 'info'
      })
    },
    getWordCount (string) {
      if (string !== undefined) {
        return string.split(' ').length
      } else {
        return 0
      }
    },
    getEstTime (wordcount) {
      return Math.ceil(wordcount / 120)
    },
    onSectionDrag (val) {
      console.log('section drag', val)
      this.drag = false
      if (val.moved) {
        console.log('moved')
        this.document.modifiedDate = new Date()
        this.document.modifiedBy = this.$firebase.auth.currentUser.uid
        this.$fiery.update(this.document).then(() => {
          console.log('saved')
        })
      }
    },
    onChangeMod (val, sectionid) {
      console.log('module changed', val)
      if (sectionid === 'hook') {
        this.$fiery.update(this.structure.hook, ['moduleOrder']).then(() => {
          console.log('saved')
        })
      } else {
        this.$fiery.update(this.sections[sectionid], ['moduleOrder']).then(() => {
          console.log('saved')
        })
      }
    }
  }
}
</script>

<style>

.module-card {
  margin-bottom: 20px;
}

.section-card {
  margin-bottom: 10px;
  background-color: inherit;
  border: 2px dashed var(--q-color-primary);
}

.add-module-modal {
  padding: 20px;
}

.drag-handle {
  float: left;
  height: 60px;
  margin-right: -5px;
  padding-top: 20px;
  padding-left: 4px;
  padding-right: 4px;
  opacity: 0.5;
  cursor: move;
}

.drag-handle:hover {
  opacity: .7;
}

</style>
