import { h, ref, watch, watchEffect, onMounted } from 'vue';
import { VDialog, VCard, VCardTitle, VCardText, VCardActions, VTextField, VSelect, VBtn, VSpacer, VRow, VCol, VIcon } from 'vuetify/components';
import { getAll } from '../../api/indexeddb';

export default {
  name: 'ModalGeneric',
  props: {
    title: String,
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
          } else {
            field.value = field.ispassword ? '' : props.item[field.key];
          }
        });
      } else if (props.mode === 'create') {
        props.formFields.forEach((field) => field.value = '');
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
          h(VCardText, {}, () => props.mode !== 'delete'
            ? h(VRow, {}, () => props.formFields.map(input =>
              h(VCol, { cols: '12', key: input.key }, () =>
                input.selector
                  ? h(VSelect, {
                    items: relationData.value[input.fk] || [],
                    label: input.label,
                    itemTitle: 'name',
                    itemValue: 'id',
                    variant: 'outlined',
                    modelValue: input.value,
                    'onUpdate:modelValue': (val) => input.value = val
                  })
                  : h(VTextField, {
                    modelValue: input.value,
                    'onUpdate:modelValue': (val) => input.value = val,
                    label: input.label,
                    rules: input.rules,
                    type: input.ispassword ? (visible.value ? 'text' : 'password') : input.type,
                    variant: 'outlined',
                    appendInnerIcon: input.ispassword ? (visible.value ? 'mdi-eye-off' : 'mdi-eye') : null,
                    prependInnerIcon: input.ispassword ? 'mdi-lock-outline' : null,
                    'onClick:appendInner': () => input.ispassword && (visible.value = !visible.value),
                    'append-inner': input.ispassword ? () => h(VIcon, () => visible.value ? 'mdi-eye-off' : 'mdi-eye') : undefined,
                    'prepend-inner': input.ispassword ? () => h(VIcon, () => 'mdi-lock-outline') : undefined
                  })
              )
            ))
            : h('p', {}, () => 'Quieres eliminar este registro?')
          ),
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
  }
};