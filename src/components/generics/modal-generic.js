import { h, ref, watch, watchEffect, onMounted, inject } from 'vue';
import { VDialog, VCard, VCardTitle, VCardText, VCardActions, VTextField, VSelect, VBtn, VSpacer, VRow, VCol, VIcon } from 'vuetify/components';

import { VFileUpload } from 'vuetify/labs/VFileUpload';
import { getAll } from '../../api/indexeddb';
import { useI18nStore } from '../../store/i18n';

export default {
  name: 'ModalGeneric',
  props: {
    title: String,
    endpoint: String,
    formFields: Array,
    mode: String,
    item: Object,
    relations: Array,
    maxWidth: {
      type: String,
      default: '100%'
    },
    persistent: Boolean,
    width: [String, Number],
    fullscreen: Boolean,
    scrollable: Boolean
  },
  setup(props, { slots, expose }) {
    const i18n = useI18nStore();
    const isOpen = ref(false);
    const visible = ref(false);
    const valueItem = ref(null);
    const relationData = ref({});

    const fetchRelationData = async () => {
      if (!props?.relations) return;

      const promises = props.relations.map(async (relation) => {
        const data = await getAll(relation.endpoint);
        return {
          key: relation.key,
          data: data.map(item => ({ id: item.id, name: item.name }))
        };
      });

      const results = await Promise.all(promises);
      relationData.value = results.reduce((acc, result) => {
        acc[result.key] = result.data;
        return acc;
      }, {});
    };

    onMounted(fetchRelationData);

    watchEffect(() => {

      valueItem.value = { ...props.item };
      if (props.mode === 'edit') {
        props.formFields.forEach((field) => {
          if (field.selector) {
            field.value = props.item[field.fk];
          } else if (field.isFileUpload) {
            field.value = []; // Initialize file field as empty array
          } else {
            field.value = field.ispassword ? '' : props.item[field.key];
          }
        });
      } else if (props.mode === 'create') {
        props.formFields.forEach((field) => {
          field.value = field.isFileUpload ? [] : '';
        });
      }
    });

    watch(
      () => props.formFields,
      (newFields) => {
        newFields.forEach((field) => {
          if (field.selector) {
            valueItem.value[field.fk] = field.value;
          } else {
            valueItem.value[field.key] = field.value;
          }
        });
      },
      { deep: true }
    );

    const handleOpen = () => isOpen.value = true;
    const handleClose = () => isOpen.value = false;

    expose({ handleOpen, handleClose, valueItem, isOpen });

    const getEndpoint = (title) => {
      const lowercaseTitle = title.toLowerCase();
      if (lowercaseTitle.includes('product')) return 'products';
      if (lowercaseTitle.includes('categor')) return 'categories';
      if (lowercaseTitle.includes('rack')) return 'racks';
      if (lowercaseTitle.includes('shelve')) return 'shelves';
      return '';
    };

    return () => h(VDialog, {
      modelValue: isOpen.value,
      'onUpdate:modelValue': (val) => isOpen.value = val,
      maxWidth: props.maxWidth,
      persistent: props.persistent,
      width: props.width,
      fullscreen: props.fullscreen,
      scrollable: props.scrollable
    }, {
      default: () => h(VCard, {}, {
        default: () => [
          h(VCardTitle, {}, () => props.title),
          h(VCardText, {}, () => {
            if (props.mode === 'delete') {
              return h('div', {
                class: 'text-h6 text-center pa-4',
                style: 'min-height: 100px; display: flex; align-items: center; justify-content: center;'
              }, i18n.t('modals.deleteConfirm'));
            }
            return h(VRow, {}, () => props.formFields.map(input =>
              h(VCol, { cols: '12', key: input.key }, () =>
                input.selector
                  ? h(VSelect, {
                    items: relationData.value[input.fk] || [],
                    label: `${i18n.t(`forms.label.${getEndpoint(props.endpoint)}.${input.key}`)}`,
                    placeholder: `${i18n.t(`forms.placeholders.${getEndpoint(props.endpoint)}`)}`,
                    itemTitle: 'name',
                    itemValue: 'id',
                    variant: 'outlined',
                    modelValue: input.value,
                    'onUpdate:modelValue': (val) => input.value = val,
                    rules: input.rules?.map(rule =>
                      (v) => rule(v) || i18n.t('forms.validation.required')
                    )
                  })
                  : input.isFileUpload
                    ? h(VFileUpload, {
                      modelValue: Array.isArray(input.value) ? input.value : [], // Ensure array
                      'onUpdate:modelValue': (val) => input.value = val,
                      accept: input.accept,
                      label: `${input.label} (Max: ${input.maxSize}MB)`,
                      rules: input.rules?.map(rule =>
                        (v) => rule(v) || i18n.t('forms.validation.required')
                      ),
                      title: `${i18n.t(`forms.label.import.title`)}`,
                      multiple: input.multiple,
                      maxFiles: input.maxFiles,
                      maxFileSize: input.maxSize * 1024 * 1024,
                      density: 'comfortable',
                      clearable: true,
                      showSize: true,
                      multiple: false, // Keep single file mode
                      chips: true,
                      hideDetails: false,
                      counter: true,


                      placeholder: `${i18n.t(`forms.placeholders.${getEndpoint(props.title)}.${input.key}`)}`
                    })
                    : h(VTextField, {
                      modelValue: input.value,
                      'onUpdate:modelValue': (val) => input.value = val,
                      label: `${i18n.t(`forms.label.${getEndpoint(props.endpoint)}.${input.key}`)}`,
                      placeholder: `${i18n.t(`forms.placeholders.${getEndpoint(props.title)}.${input.key}`)}`,
                      rules: input.rules?.map(rule =>
                        (v) => rule(v) || i18n.t('forms.validation.required')
                      ),
                      type: input.ispassword ? (visible.value ? 'text' : 'password') : input.type,
                      variant: 'outlined',
                      appendInnerIcon: input.ispassword ? (visible.value ? 'mdi-eye-off' : 'mdi-eye') : null,
                      prependInnerIcon: input.ispassword ? 'mdi-lock-outline' : null,
                      'onClick:appendInner': () => input.ispassword && (visible.value = !visible.value),
                      'append-inner': input.ispassword ? () => h(VIcon, () => visible.value ? 'mdi-eye-off' : 'mdi-eye') : undefined,
                      'prepend-inner': input.ispassword ? () => h(VIcon, () => 'mdi-lock-outline') : undefined
                    })
              )
            ));
          }),
          slots.default && h(VCardText, {}, () => slots.default()),
          h(VCardActions, { class: 'flex justify-end gap-4' }, {
            default: () => [
              h(VSpacer),
              h(VBtn, {
                variant: 'tonal',
                color: 'info',
                onClick: handleClose
              }, () => 'Close'),
              slots.buttonAction?.()
            ]
          })
        ]
      })
    });
  },

};