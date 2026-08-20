import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import vuetify from '../src/plugins/vuetify';
import AppDropdown from '../src/components/common/AppDropdown.vue';

describe('AppDropdown.vue Molecular Test', () => {
  it('renders correctly with label and required items', () => {
    const items = [
      { text: 'Option 1', value: '1' },
      { text: 'Option 2', value: '2' }
    ];
    
    const wrapper = mount(AppDropdown, {
      global: { plugins: [vuetify] },
      props: {
        label: 'My Dropdown',
        items
      }
    });
    
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('My Dropdown');
  });
  
  it('receives correct props', () => {
    const items = [
      { text: 'Option 1', value: '1' },
      { text: 'Option 2', value: '2' }
    ];
    
    const wrapper = mount(AppDropdown, {
      global: { plugins: [vuetify] },
      props: { items, showAsIcon: true, icon: 'mdi-dots-vertical' }
    });
    
    expect(wrapper.props().items).toEqual(items);
    expect(wrapper.props().showAsIcon).toBe(true);
    expect(wrapper.props().icon).toBe('mdi-dots-vertical');
  });
});
