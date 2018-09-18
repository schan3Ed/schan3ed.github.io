import { toJS } from 'mobx';

export const getFlattenedValues = (form, valueKey = 'value') => {
    let data = {};
    let _form = toJS(form).fields;
    Object.keys(_form).map(key => {
        if(_form[key][valueKey] !== null && _form[key][valueKey] !== undefined) {
            data[key] = _form[key][valueKey]
        }
        
    });
    return data
}
