<template>
  <q-card flat style="position: relative;">
    <div class="round-borders bg-primary drag-section" v-if="(!$q.platform.is.mobile || $q.platform.is.ipad) && id !== 'hook'">
      <q-icon name="fas fa-arrows-alt" size="1.5rem" />
    </div>
    <q-card-title style="position: relative;">
      <q-btn color="dark" icon="fas fa-ellipsis-v" style="position: absolute; top: 10px; right: 10px;" v-if="id !== 'hook'">
        <q-popover anchor="bottom right" self="top right">
          <q-list>
            <q-item link v-close-overlay @click.native="editTitle = true">Edit</q-item>
            <q-item link @click.native="remove(id)">Delete</q-item>
          </q-list>
        </q-popover>
      </q-btn>
      <h5 style="margin: 0;">
        <q-icon v-if="!open" name="fas fa-caret-right cursor-pointer" style="margin-top: -5px; padding-left: 4px; padding-right: 4px;" size="2rem" @click.native="open = true" />
        <q-icon v-if="open" name="fas fa-caret-down cursor-pointer" style="margin-top: -5px;" size="2rem" @click.native="open = false" />
        &nbsp;
        {{ id === 'hook' ? 'Hook' : id === 'bible' ? 'Bible Refs' : data.title }}
      </h5>
    </q-card-title>
    <div class="row gutter-sm" style="padding-left: 10px; padding-right: 10px;" v-if="open && data.moduleOrder">
      <div class="col-12" v-if="id === 'bible'">
        <mod-bible
          v-for="ref in document.bibleRefs"
          :key="ref"
          class="module-card"
          :mod-options="{ disabled: true }"
          :data="{
            bibleRef: ref
          }"
        />
      </div>
      <div class="col-12" v-if="modules && data.moduleOrder">
        <draggable style="min-height: 20px;" :list="data.moduleOrder" @change="changeMod" ref="secModuleDrag" :options="{ group: { name: 'modules', pull: true, put: true }, ghostClass: 'sortable-ghost', handle: '.drag-handle', disabled: disabled || ($q.platform.is.mobile && !$q.platform.is.ipad) }">
          <!-- <component
            v-if="data.moduleOrder.length > 0 && Object.keys(modules).length > 0"
            v-for="modIndex in data.moduleOrder"
            :key="modIndex"
            v-bind:is="'mod-' + modules[modIndex].type"
            :id="modIndex"
            :data="modules[modIndex]"
            :edit="editModule"
            :save="saveModule"
            :autosave="autoSaveModule"
            :close="closeModule"
            :remove="removeModule"
            :mod-methods="methods"
            :mod-options="options"
            class="module-card"
            v-bind:class="{ 'active-card': modules[modIndex].editing === $firebase.auth.currentUser.uid }"
          /> -->
          <component
            v-for="modIndex in data.moduleOrder"
            :key="modIndex"
            v-bind:is="contentTypes.includes(modules[modIndex].type) ? 'mod-content' : modules[modIndex].nqmedia ? 'mod-n-q' : 'mod-media'"
            :id="modIndex"
            :data="modules[modIndex].type === 'mainidea' ? { title: document.mainIdea, type: 'mainidea' } : modules[modIndex]"
            :edit="editModule"
            :save="saveModule"
            :autosave="autoSaveModule"
            :close="closeModule"
            :remove="removeModule"
            :mod-methods="methods"
            :mod-options="options"
            class="module-card"
            v-bind:class="{ 'active-card': modules[modIndex].editing === $firebase.auth.currentUser.uid }"
          />
        </draggable>
      </div>
      <div class="col-12" style="padding-top: 0;" v-if="id !== 'bible'">
        <add-module :next-mod-order="nextModOrder" :sectionid="id" :edit="editModule" :close="closeModule" :content-type="contentType" dark />
      </div>
    </div>
    <q-modal v-model="editTitle" ref="editSectionTitle" content-classes="edit-section-modal">
      <div class="row gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            @click.native="editTitle = false"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h4>Edit Title</h4>
        </div>
        <div class="col-12">
          <q-input v-model="newTitle" float-label="Title" type="text" @keyup.enter="edit(id, { title: newTitle }); editTitle=false" />
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="edit(id, { title: newTitle }); editTitle=false">Save</q-btn>
        </div>
      </div>
    </q-modal>
  </q-card>
</template>

<script>
import Draggable from 'vuedraggable'
import AddModule from 'components/AddModule.vue'
// import ModText from 'components/modules/Text.vue'
import ModBible from 'components/modules/Bible.vue'
// import ModActivity from 'components/modules/Activity.vue'
// import ModQuestion from 'components/modules/Question.vue'
import ModContent from 'components/modules/Content.vue'
// import ModQuote from 'components/modules/Quote.vue'
// import ModVideo from 'components/modules/Video.vue'
// import ModImage from 'components/modules/Image.vue'
// import ModComposition from 'components/modules/Composition.vue'
// import ModIllustration from 'components/modules/Illustration.vue'
import ModMedia from 'components/modules/Media.vue'
import ModNQ from 'components/modules/NQMedia.vue'

export default {
  components: {
    Draggable,
    AddModule,
    // ModText,
    ModBible,
    // ModActivity,
    // ModQuestion,
    ModContent,
    // ModQuote,
    // ModVideo,
    // ModImage,
    // ModComposition,
    // ModIllustration
    ModMedia,
    ModNQ
  },
  name: 'ModuleSection',
  props: ['id', 'data', 'modules', 'edit', 'remove', 'disabled', 'document', 'contentType', 'contentid', 'onChange'],
  fiery: true,
  data () {
    return {
      drag: false,
      editTitle: false,
      newTitle: '',
      open: true,
      contentTypes: [ 'text', 'bible', 'activity', 'question', 'mainidea', 'bullet' ],
      mediaTypes: [ 'quote', 'video', 'image', 'illustration', 'composition', 'outline', 'idea' ],
      methods: {
        edit: (moduleid) => { this.$emit('edit', moduleid, this.id) },
        save: (moduleid, data) => { this.$emit('save', moduleid, this.id, data) },
        autosave: (moduleid, text) => { this.$emit('autosave', moduleid, this.id, text) },
        close: (moduleid) => { this.$emit('close', moduleid, this.id) },
        remove: (moduleid) => { this.$emit('remove', moduleid, this.id) }
      },
      options: {}
    }
  },
  computed: {
    nextModOrder: function () {
      if (this.data.modules) {
        return this.data.modules.length
      } else {
        return 0
      }
    }
  },
  watch: {
    'data.title': function (newVal) {
      this.newTitle = newVal
    }
  },
  mounted () {
    this.newTitle = this.data.title
  },
  methods: {
    editModule (moduleid) {
      this.$emit('edit', moduleid, this.id)
    },
    saveModule (moduleid, data) {
      this.$emit('save', moduleid, this.id, data)
    },
    autoSaveModule (moduleid, text) {
      this.$emit('autosave', moduleid, this.id, text)
    },
    closeModule (moduleid) {
      this.$emit('close', moduleid, this.id)
    },
    removeModule (moduleid) {
      this.$emit('remove', moduleid, this.id)
    },
    changeMod (val) {
      this.onChange(val, this.id)
    },
    addMod (type) {
      console.log('add mod', type)
    },
    reorder () {
      console.log('module list', this.data.modules)
    }
  }
}
</script>

<style>

.edit-section-modal {
  padding: 20px;
}

/* .q-card-title {
  height: 36px;
} */

.sortable-ghost {
  opacity: 0.5;
}

</style>
