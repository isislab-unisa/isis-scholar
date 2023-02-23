import React, { useState, useEffect } from 'react';
import {Spin, Table} from 'antd';
import cloneDeep from 'lodash.clonedeep';
import "./CTable.css"
import {API} from "../api";


//todo refactor getColumns (row render 4 times?)

export default function CTable ({url, dataSource, columns, actions, api, filters}) {

    const container = React.createRef();

    const [_dataSource, setDataSource] = useState(dataSource);
    const [_currentPage, setCurrentPage] = useState(api && api.pagination ? api.pagination.defaultCurrent : 1);
    const [_state, setState] = useState({
        ready: false,
        columns: [],
        api: {},
        size: 'small',
        y: 260 //6 small row
    })

    useEffect(() => {//console.log('A')
        getDataSource();
    }, [dataSource, filters]);

    useEffect(() => {//console.log('b')
        if(!_dataSource)
            return;//console.log('B')
        if(!_state.ready) {
            let _api = getApi();
            let _size = getSize();
            let y = getScrollHeight(_size);
            let _columns = getColumns(_size);
            setState({
                ready: true,
                api: _api,
                size: _size,
                y: y,
                columns: _columns
            })
        } else {
            let _columns = getColumns(_state.size);
            setState({
                ..._state,
                columns: _columns
            })
        }
    }, [_dataSource, _currentPage]);



    const getDataSource = async () => {

        /*if(!dataSource) {
            dataSource = await API.request('GET', url);
            dataSource.reverse();
        }*/
        let data = cloneDeep(dataSource)
        if(filters){
            //No filters - show all entries
            let include = true
            filters.map(f => {
                if(f.values.length > 0)
                    include = false
            })
            if(!include) {
                //apply filters
                data = data.filter(d => {
                    include = true
                    for (let filter of filters) {
                        for (let values of filter.values) {
                            if (d[filter.field] && d[filter.field].indexOf(values) === -1) {
                                include = false
                                break
                            }
                        }
                        if(!include) break
                    }
                    return include
                })
            }
        }
        setDataSource(data);
    }

    const getApi = () => {
        if (!api.pagination) //default
            api.pagination = {
                hideOnSinglePage:true
            };

        api.pagination.onChange = page => setCurrentPage(page);
        return api;
    }

    const getSize = () => {
        if (api.size)
            return api.size;
        if (window.innerHeight <= 800)
            return "small";
        if (window.innerHeight <= 900)
            return "middle";
        return "default";
    }

    const getScrollHeight = (size) => {//todo check height const
        let h = container.current.offsetHeight;

        if(size === 'small') {
            h -= 97;
            if(api.pagination.hideOnSinglePage)
                h += 58;
        } else if(size === 'middle') {
            h -= 105;
            if(api.pagination.hideOnSinglePage)
                h += 58;
        } else {//default
            h -= 120;
            if(api.pagination.hideOnSinglePage)
                h += 65;
        }

        if (actions && actions.indexOf('add') > -1)
            h -= 48;

        return h;
    }

    const getColumns = (size) => {
        let columnsCopy = cloneDeep(columns);

        if(!columnsCopy) {
            columnsCopy = [];
            Object.keys(_dataSource[0]).forEach(key => {
                columnsCopy.push({
                    title: key,
                    dataIndex: key,
                    key: key,
                });
            });
        }

        return columnsCopy;
    }

    return (
        <div className={'ant-table-custom'} ref={container}>
            {_state.ready ? <Table
                    dataSource={_dataSource}
                    columns={_state.columns}
                    {..._state.api}
                    size={_state.size}
                    scroll={{x: 'auto', y: _state.y}}
                /> :
                <div className={'cd-loader'}>
                    <Spin size={'large'} tip={'Loading'} />
                </div>
            }
        </div>
    );
};