import { h, ref, computed, onMounted, inject } from 'vue';
import { useGenericFetchQueries } from '../../api/generic-fetch-querys';
import ModalGeneric from './modal-generic';
import { useToast } from 'vue-toast-notification';
import { VTable, VToolbar, VBtn, VSpacer, VTextField, VIcon } from 'vuetify/components';
import { useI18nStore } from '../../store/i18n';

export default {
  name: 'GenericTableCrud',
  props: {
    title: String,
    columns: Array,
    mockData: Array,
    formFields: Array,
    endpoint: String,
    relations: Array,
    extraRowActions: Array, // [{ label, icon, color, event }] — emitted on eventBus with row data
  },
  setup(props) {
    const toast = useToast();
    const dialog = ref(null);
    const mode = ref('create');
    const selectedItem = ref(null);
    const search = ref('');
    const items = ref([]);

    const { fetchQuery, fetchRelatedData, createMutation, updateMutation, deleteMutation } = useGenericFetchQueries(props.endpoint);
    const eventBus = inject('eventBus');
    const i18n = useI18nStore();

    const loadItems = async () => {
      try {
        const data = await fetchRelatedData();

        switch (props.endpoint) {
          case 'products':
            items.value = data.products.map(product => ({
              ...product,
              category_name: data.categories.find(category => category.id === product.category_id)?.name || '',
              shelve_name: data.shelves.find(shelve => shelve.id === product.shelve_id)?.name || '',
              rack_name: data.racks.find(rack => rack.id === product.rack_id)?.name || '',
            }));
            break;
          case 'categories':
            items.value = data.categories;
            break;
          case 'shelves':
            items.value = data.shelves;
            break;
          case 'racks':
            items.value = data.racks;
            break;
          default:
            items.value = [];
            break;
        }
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };

    // Setup event listener with cleanup
    onMounted(() => {
      loadItems();

      // Improved event listener with immediate execution
      const handleRefresh = async () => {
        await loadItems();
        items.value = [...items.value]; // Force reactivity update
      };

      eventBus.on('refreshData', handleRefresh);

      // Clean up the event listener when component is unmounted
      return () => {
        eventBus.off('refreshData', handleRefresh);
      };
    });

    const handleClear = () => {
      props.formFields.forEach((field) => {
        field.value = '';
      });
    };

    const openModal = (modalMode, item = null) => {
      mode.value = modalMode;
      selectedItem.value = item;
      dialog.value?.handleOpen();
    };

    const handlers = {
      async create() {
        try {
          await createMutation(dialog.value?.valueItem);
          dialog.value?.handleClose();
          toast.success(i18n.t('messages.success.created'));
          handleClear();
          await loadItems();
          items.value = [...items.value]; // Force reactivity update
          eventBus.emit('refreshData');
        } catch (error) {
          console.error('Failed to create data:', error);
          toast.error(i18n.t('messages.error.create'));
        }
      },
      async update() {
        try {
          await updateMutation(dialog.value?.valueItem);
          dialog.value?.handleClose();
          handleClear();
          toast.success(i18n.t('messages.success.updated'));
          await loadItems();
          items.value = [...items.value]; // Force reactivity update
          eventBus.emit('refreshData');
        } catch (error) {
          console.error('Failed to update data:', error);
          toast.error(i18n.t('messages.error.update'));
        }
      },
      async delete() {
        try {
          await deleteMutation(selectedItem.value.id);
          dialog.value?.handleClose();
          toast.success(i18n.t('messages.success.deleted'));
          await loadItems();
          items.value = [...items.value]; // Force reactivity update
          eventBus.emit('refreshData');
        } catch (error) {
          console.error('Failed to delete data:', error);
          toast.error(i18n.t('messages.error.delete'));
        }
      }
    };

    const filteredItems = computed(() => {
      if (!search.value) return items.value;
      return items.value.filter(item => {
        return props.columns.some(column => {
          return String(item[column.key]).toLowerCase().includes(search.value.toLowerCase());
        });
      });
    });

    const translatedColumns = computed(() => props.columns.map(column => ({
      ...column,
      title: `${i18n.t(`tables.${props.endpoint}.columns.${column.key}`)}`
    })));

    return () => h('div', [
      h(VToolbar, { class: 'ma-1' }, () => [
        h('h2', i18n.t(`tables.${props.endpoint}.title`)),
        h(VSpacer),
        h(VTextField, {
          'max-width': '15rem',
          focused: true,
          density: 'compact',
          modelValue: search.value,
          'onUpdate:modelValue': (val) => search.value = val,
          label: i18n.t('common.search'),
          'prepend-inner-icon': 'mdi-magnify',
          variant: 'outlined',
          'hide-details': true,
          'single-line': true
        }),
        h(VBtn, {
          class: 'ml-2 mr-2',
          onClick: () => openModal('create'),
          color: 'primary',
          variant: 'elevated', // Change from tonal to elevated
          elevation: '2'       // Add elevation
        }, () => i18n.t('actions.create'))
      ]),

      h(VTable, { 'fixed-header': true }, {
        default: () => [
          h('thead', [
            h('tr', [
              ...translatedColumns.value.map(column =>
                h('th', { key: column.id }, column.title)
              ),
              h('th', i18n.t('common.actions'))
            ])
          ]),
          h('tbody', filteredItems.value.map(data =>
            h('tr', { key: data.id }, [
              ...props.columns.map(column =>
                h('td', { key: column.id }, data[column.key])
              ),
              h('td', [
                h(VBtn, {
                  onClick: () => openModal('edit', data),
                  density: 'comfortable',
                  color: 'primary',
                  variant: 'elevated',  // Change to elevated
                  class: 'mx-1',       // Add spacing
                  elevation: '2'        // Add elevation
                }, () => h(VIcon, () => 'mdi-pencil')),
                h(VBtn, {
                  onClick: () => openModal('delete', data),
                  density: 'comfortable',
                  color: 'error',
                  variant: 'elevated',  // Change to elevated
                  class: 'mx-1',       // Add spacing
                  elevation: '2'        // Add elevation
                }, () => h(VIcon, () => 'mdi-delete')),
                ...(props.extraRowActions || []).map(action =>
                  h(VBtn, {
                    key: action.event,
                    onClick: () => eventBus.emit(action.event, data),
                    density: 'comfortable',
                    color: action.color || 'secondary',
                    variant: 'elevated',
                    class: 'mx-1',
                    elevation: '2',
                    title: action.label,
                  }, () => h(VIcon, () => action.icon))
                )
              ])
            ])
          ))
        ]
      }),

      h(ModalGeneric, {
        ref: dialog,
        maxWidth: '500',
        title: mode.value === 'create'
          ? `${i18n.t(`tables.${props.endpoint}.create`)}`
          : mode.value === 'edit'
            ? `${i18n.t(`tables.${props.endpoint}.edit`)}`
            : `${i18n.t(`tables.${props.endpoint}.delete`)}`,
        formFields: props.formFields,
        mode: mode.value,
        endpoint: props.endpoint,
        item: selectedItem.value,
        relations: props.relations
      }, {
        buttonAction: () => mode.value === 'create'
          ? h(VBtn, {
            onClick: handlers.create,
            color: 'primary',
            variant: 'elevated',  // Change from tonal
            elevation: '2',       // Add elevation
            class: 'px-4'        // Add padding
          }, () => [
            i18n.t('actions.save'),
            h(VIcon, { class: 'ml-2' }, () => 'mdi-check')
          ])
          : mode.value === 'edit'
            ? h(VBtn, {
              onClick: handlers.update,
              color: 'primary',
              variant: 'elevated',  // Change from tonal
              elevation: '2',       // Add elevation
              class: 'px-4'        // Add padding
            }, () => [
              i18n.t('actions.save'),
              h(VIcon, { class: 'ml-2' }, () => 'mdi-check')
            ])
            : h(VBtn, {
              onClick: handlers.delete,
              color: 'secondary',
              variant: 'elevated',  // Change from tonal
              elevation: '2',       // Add elevation
              class: 'px-4'        // Add padding
            }, () => [
              i18n.t('actions.confirm'),
              h(VIcon, { class: 'ml-2' }, () => 'mdi-check')
            ])
      })
    ]);
  }
};
