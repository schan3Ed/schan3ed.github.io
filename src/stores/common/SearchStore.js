import { action, observable, computed } from 'mobx'
import * as searchjs from 'searchjs';
import moment from 'moment'

class SearchStore {
    @observable list = []
    @observable query = null
    @observable sortCondition = 'name-asc'
    @observable filterConditions = {
        Delivery: {
            field: 'delivery',
            value: true,
            active: false,
            strict: true,
        },
        Pickup: {
            field: 'pickup',
            value: true,
            active: false,
            strict: true,
        },
        Local: {
            field: 'isLocallyGrown',
            value: true,
            active: false,
            strict: true,
        },
        Organic: {
            field: 'isOrganic',
            value: true,
            active: false,
            strict: true,
        },
        Public: {
            field: 'public',
            value: true,
            active: false,
            strict: false,
        },
        Fruit: {
            field: 'foodOption',
            value: 'Fruit',
            active: false,
            strict: false,
        },
        Vegetables: {
            field: 'foodOption',
            value: 'Vegetables',
            active: false,
            strict: false,
        },
        Dairy: {
            field: 'foodOption',
            value: 'Dairy',
            active: false,
            strict: false,
        },
        Meat: {
            field: 'foodOption',
            value: 'Meat',
            active: false,
            strict: false,
        },
        Bakery: {
            field: 'foodOption',
            value: 'Bakery',
            active: false,
            strict: false,
        },
        Fungi: {
            field: 'foodOption',
            value: 'Fungi',
            active: false,
            strict: false,
        },
        Other: {
            field: 'foodOption',
            value: 'Other',
            active: false,
            strict: false,
        }
    }

    @computed get List() {
        if (!this.list)
            return this.list;

        let _matches = this.list;

        if (this.query)
            _matches = this.matchQuery(_matches);

        const filtered = this.isFiltered();
        if (filtered){
            _matches = this.matchFilterConditions(_matches);
            _matches = this.matchFilterConditions(_matches,true);
        }

        _matches = this.applySort(_matches);
        return _matches;
    }

    isFiltered() {
        return Object.values(this.filterConditions).reduce((a,b) => {
            return  {active: a.active || b.active};
        }).active
    }

    matchQuery(list) {
        return searchjs.matchArray(list, { "name": this.query, _propertySearch: true, _text: true })
    }

    matchFilterConditions(list, strict = false) {
        let newList = strict? list : [];
        const conditionList = Object.values(this.filterConditions).filter((condition) => {return (condition.strict === strict && condition.active)})
        if(conditionList.length > 0){
            conditionList.map((condition) => {
                let morphList = strict? newList: list; 
                let { field, value } = condition;
                let arr = searchjs.matchArray(morphList, { [field]: value, _propertySearch: true});
                newList = strict? arr : [...new Set([...newList, ...arr])];
            })
            return newList;
        } else {
            return list;
        }
    }

    nameSort(list, ascending) {
        if (ascending) {
            list = list.sort((a, b) => {
                return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
            })
        } else {
            list = list.sort((a, b) => {
                return a.name.toLowerCase() > b.name.toLowerCase() ? -1 : 1;
            })
        }
        return list;
    }

    dateSort(list, ascending) {
        if (ascending) {
            list = list.sort((a, b) => {
                return moment(a.useByDate).valueOf() > moment(b.useByDate).valueOf() ? 1 : -1;
            })
        } else {
            list = list.sort((a, b) => {
                return moment(a.useByDate).valueOf() > moment(b.useByDate).valueOf() ? -1 : 1;
            })
        }
        return list;
    }

    applySort(list) {
        switch (this.sortCondition) {
            case 'name-asc':
                list = this.nameSort(list, true);
                break;
            case 'name-desc':
                list = this.nameSort(list, false);
                break;
            case 'use-by-date-asc':
                list = this.dateSort(list, true);
                break;
            case 'use-by-date-desc':
                list = this.dateSort(list, false);
                break;
        }
        return list;
    }

    @action
    resetSearch() {
        this.query = null;
        Object.values(this.filterConditions).map((condition) => condition.active = false);
        this.sortCondition = 'name-asc';
    }

    @action
    updateSort(sort) {
        this.sortCondition = sort;
    }

    @action
    onCheckboxChange = (validator, active) => {
        this.filterConditions[validator].active = active;
    }
    
    @action
    onRadioChange = (validator, value, active) => {
        this.filterConditions[validator].active = active;
        this.filterConditions[validator].value = value;
    }

    @action
    updateQuery(query) {
        this.query = query;
    }

    @action
    setList(list) {
        this.list = list;
    }

}
const searchStore = new SearchStore();
export default searchStore