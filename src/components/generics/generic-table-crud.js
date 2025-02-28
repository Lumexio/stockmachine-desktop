import { h, ref, computed } from 'vue';
import { useGenericFetchQueries } from '../../api/generic-fetch-querys';
import ModalGeneric from './modal-generic';
import { useToast } from 'vue-toast-notification';
import { VTable, VToolbar, VBtn, VSpacer, VTextField, VIcon } from 'vuetify/components';

export default {
  name: 'GenericTableCrud',
  props: {
    title: String,
    columns: Array,
    mockData: Array,
    formFields: Array,
    endpoint: String,
    relations: Array,
  },
  setup(props) {
    const toast = useToast();
    const dialog = ref(null);
    const mode = ref('create');
    const selectedItem = ref(null);
    const search = ref('');
    const items = ref([]);

    const { fetchQuery, fetchRelatedData, createMutation, updateMutation, deleteMutation } = useGenericFetchQueries(props.endpoint);

    const loadItems = async () => {
      const { products, categories, shelves, racks } = await fetchRelatedData();

      switch (props.endpoint) {
        case 'products':
          items.value = products.map(product => ({
            ...product,
            category_name: categories.find(category => category.id === product.category_id)?.name || '',
            shelve_name: shelves.find(shelve => shelve.id === product.shelve_id)?.name || '',
            rack_name: racks.find(rack => rack.id === product.rack_id)?.name || '',
          }));
          break;
        case 'categories':
          items.value = categories;
          break;
        case 'shelves':
          items.value = shelves;
          break;
        case 'racks':
          items.value = racks;
          break;
        default:
          items.value = [];
          break;
      }
    };

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
          toast.success('Registro creado correctamente');
          handleClear();
          loadItems();
        } catch (error) {
          console.error('Failed to create data:', error);
          toast.error('Se ha producido un error al crear el registro');
        }
      },
      async update() {
        try {
          await updateMutation(dialog.value?.valueItem);
          dialog.value?.handleClose();
          handleClear();
          toast.success('Registro actualizado correctamente');
          loadItems();
        } catch (error) {
          console.error('Failed to update data:', error);
          toast.error('Se ha producido un error al actualizar el registro');
        }
      },
      async delete() {
        try {
          await deleteMutation(selectedItem.value.id);
          dialog.value?.handleClose();
          toast.success('Registro eliminado correctamente');
          loadItems();
        } catch (error) {
          console.error('Failed to delete data:', error);
          toast.error('Se ha producido un error al eliminar el registro');
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

    loadItems();

    return () => h('div', [
      h(VToolbar, { class: 'ma-1' }, () => [
        h('h2', props.title),
        h(VSpacer),
        h(VTextField, {
          'max-width': '15rem',
          focused: true,
          density: 'compact',
          modelValue: search.value,
          'onUpdate:modelValue': (val) => search.value = val,
          label: 'Search',
          'prepend-inner-icon': 'mdi-magnify',
          variant: 'outlined',
          'hide-details': true,
          'single-line': true
        }),
        h(VBtn, {
          class: 'ml-2 mr-2',
          onClick: () => openModal('create'),
          color: 'primary',
          variant: 'tonal'
        }, () => 'Create')
      ]),

      h(VTable, { 'fixed-header': true }, {
        default: () => [
          h('thead', [
            h('tr', [
              ...props.columns.map(column =>
                h('th', { key: column.id }, column.title)
              ),
              h('th', 'Actions')
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
                }, () => h(VIcon, () => 'mdi-pencil')),
                h(VBtn, {
                  onClick: () => openModal('delete', data),
                  density: 'comfortable',
                  color: 'error',
                }, () => h(VIcon, () => 'mdi-delete'))
              ])
            ])
          ))
        ]
      }),

      h(ModalGeneric, {
        ref: dialog,
        maxWidth: '500',
        title: props.title,
        formFields: props.formFields,
        mode: mode.value,
        item: selectedItem.value,
        relations: props.relations
      }, {
        buttonAction: () => mode.value === 'create'
          ? h(VBtn, {
            onClick: handlers.create,
            color: 'primary',
            variant: 'tonal'
          }, () => [
            'Save ',
            h(VIcon, () => 'mdi-check')
          ])
          : mode.value === 'edit'
            ? h(VBtn, {
              onClick: handlers.update,
              color: 'primary',
              variant: 'tonal'
            }, () => [
              'Save ',
              h(VIcon, () => 'mdi-check')
            ])
            : h(VBtn, {
              onClick: handlers.delete,
              color: 'error',
              variant: 'tonal'
            }, () => [
              'Confirmar ',
              h(VIcon, () => 'mdi-check')
            ])
      })
    ]);
  }
};
