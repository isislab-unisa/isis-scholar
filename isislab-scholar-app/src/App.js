import './App.css';
import CTable from './components/table/CTable'
import {useEffect, useState} from "react";
import {API} from "./components/api";
import {Card, Descriptions, Modal, Select, Space, notification} from "antd";
import cloneDeep from "lodash.clonedeep";

function App() {

    const [data, setData] = useState([])
    const [filters, setFilters] = useState([])
    const [keywordsOptions, setKeywordsOptions] = useState([])
    const [ownerOptions, setOwnerOptions] = useState([])
    const [sourceOptions, setSourceOptions] = useState([])
    const [typesOptions, setTypesOptions] = useState([])
    const [row, setRow] = useState(null)
    const [showAbstractModal, setShowAbstractModal] = useState(false)

    useEffect(() => {
        const getData = async () => {
            try {
                let response = await API.request('GET', `https://raw.githubusercontent.com/isislab-unisa/isis-scholar/master/data/publications.json`);
                //console.log(response)
                let data = response.data
                const owners = [...new Set(data.map(item => item[1]))];
                const sources = [...new Set(data.map(item => item[5]))];
                const types = [...new Set(data.map(item => item[6]))];
                let keywords = []
                data.map(d => {
                    if (d[4])
                        keywords = [...keywords, ...d[4].split('|').map(v => v.trim())]
                })
                keywords = [...new Set(keywords.map(item => item))];
                let options = []
                keywords.map(k =>
                    options.push({
                        label: k,
                        value: k,
                    })
                )
                setKeywordsOptions(options)

                options = []
                owners.map(k =>
                    options.push({
                        label: k,
                        value: k,
                    })
                )
                setOwnerOptions(options)

                options = []
                sources.map(k =>
                    options.push({
                        label: k,
                        value: k,
                    })
                )
                setSourceOptions(options)

                options = []
                types.map(k =>
                    options.push({
                        label: k,
                        value: k,
                    })
                )
                setTypesOptions(options)

                let f = [
                    {
                        field: '1',//owner
                        values: []
                    },
                    {
                        field: '4',//keywords
                        values: []
                    },
                    {
                        field: '5',//source
                        values: []
                    },
                    {
                        field: '6',//type
                        values: []
                    }
                ]

                setData(response.data)
                setFilters(f)
            }catch (e){
                notification.error({
                    message: `Error`,
                    description: 'Something went wrong during the data gathering!!!'
                })
            }
        }
        getData()
    },[])

    const columns = [
        {
            title: 'Year',
            dataIndex: '0',
            key: 'year',
            sorter: (a, b) => {a[0].localeCompare(b[0])}
        },
        {
            title: 'Owner',
            dataIndex: '1',
            key: 'owner',
            sorter: (a, b) => {a[1].localeCompare(b[1])}
        },
        {
            title: 'Title',
            dataIndex: '2',
            key: 'title'
        },
        {
            title: 'Abstract',
            dataIndex: '3',
            key: 'abstract',
            render: (text) => <p>{text && text.slice(0, 200) + '...'}</p>
        },
        {
            title: 'Keywords',
            dataIndex: '4',
            key: 'keywords'
        },
        {
            title: 'Source',
            dataIndex: '5',
            key: 'source'
        },
        {
            title: 'Type',
            dataIndex: '6',
            key: 'type'
        },
        {
            title: 'DOI',
            dataIndex: '7',
            key: 'doi',
            render: (text) => <a href={text} target='_blank'>{text}</a>
        }
    ]

    const api = {
        onRow : (record, index) => {
            return {
                onClick: event => {
                    console.log(record)
                    setRow(record)
                    setShowAbstractModal(true)
                }
            }
        }
    }

    const handleKeywordsChange = (values) => {
        let flt = cloneDeep(filters)
        let f = flt.find(fl => fl.field === '4')
        f.values = values
        setFilters(flt)

    }
    const handleOwnersChange = (values) => {
        let flt = cloneDeep(filters)
        let f = flt.find(fl => fl.field === '1')
        f.values = values
        setFilters(flt)

    }
    const handleSourcesChange = (values) => {
        let flt = cloneDeep(filters)
        let f = flt.find(fl => fl.field === '5')
        f.values = values
        setFilters(flt)

    }
    const handleTypessChange = (values) => {
        let flt = cloneDeep(filters)
        let f = flt.find(fl => fl.field === '6')
        f.values = values
        setFilters(flt)

    }

    function copy_data(id) {
        let r = document.createRange()
        r.selectNode(document.getElementById(id))
        window.getSelection().removeAllRanges()
        window.getSelection().addRange(r)
        try {
            document.execCommand('copy')
            window.getSelection().removeAllRanges()
            notification.info({
                message: `Info`,
                description: 'Bibtex copied on clipboard'
            })
        } catch (err) {
            notification.error({
                message: `Error`,
                description: 'Cannot copy the selected bibtex on clipboard'
            })
        }
    }


    return (
      <div className="App">
          <Space
              style={{
                  width: '100%',
              }}
              direction="horizontal"
              align="center"
          >
              <img style={{float: 'left'}} src={require('./logo.png')}/>
              <h1 style={{fontSize: '48px'}}>Scholar</h1>
          </Space>
          <Space
              style={{
                  width: '100%',
              }}
              direction="vertical"
          >
              <Card title={'Keyword'}>
                  <Select
                      key={'keywords'}
                      mode="multiple"
                      style={{
                          width: '100%',
                      }}
                      placeholder="Please select"
                      /*defaultValue={['a10', 'c12']}*/
                      onChange={handleKeywordsChange}
                      options={keywordsOptions}
                  />
              </Card>
          </Space>
          <div
              style={{
                  width: '100%',
              }}
          >
              <Card title={'Owner'} className={'filter1'}>
                  <Select
                      key={'owner'}
                      mode="multiple"
                      style={{
                          width: '100%',
                      }}
                      placeholder="Please select"
                      /*defaultValue={['a10', 'c12']}*/
                      onChange={handleOwnersChange}
                      options={ownerOptions}
                  />
              </Card>
              <Card title={'Source'} className={'filter1'}>
                  <Select
                      key={'source'}
                      mode="multiple"
                      placeholder="Please select"
                      style={{
                          width: '100%',
                      }}
                      /*defaultValue={['a10', 'c12']}*/
                      onChange={handleSourcesChange}
                      options={sourceOptions}
                  />
              </Card>
              <Card title={'Type'} className={'filter1'}>
                  <Select
                      key={'type'}
                      mode="multiple"
                      style={{
                          width: '100%',
                      }}
                      placeholder="Please select"
                      /*defaultValue={['a10', 'c12']}*/
                      onChange={handleTypessChange}
                      options={typesOptions}
                  />
              </Card>
          </div>
         <CTable dataSource={data} columns={columns} filters={filters} api={api}/>
          <Modal
              title="Scholar Entry"
              visible={showAbstractModal}
              onCancel={() => setShowAbstractModal(false)}
              footer={null}
              width={'90vw'}
          >
              { row &&
                  <Descriptions title="Information" layout="vertical" bordered>
                      <Descriptions.Item label="Year">{row[0]}</Descriptions.Item>
                      <Descriptions.Item label="Owner">{row[1]}</Descriptions.Item>
                      <Descriptions.Item label="Title">{row[2]}</Descriptions.Item>
                      <Descriptions.Item label="Abstract" span={3}>{row[3]}</Descriptions.Item>
                      <Descriptions.Item label="Type">{row[6]}</Descriptions.Item>
                      <Descriptions.Item label="Keywords">{row[4]}</Descriptions.Item>
                      <Descriptions.Item label="Source">{row[5]}</Descriptions.Item>
                      <Descriptions.Item label="DOI"><a href={row[7]} target={'_blank'}>{row[7]}</a></Descriptions.Item>
                      <Descriptions.Item label="EID">{row[8]}</Descriptions.Item>
                      <Descriptions.Item label="Bibtex"><i onClick={(e) => copy_data('bibtex')} id={'bibtex'} style={{userSelect : 'text'}}>{row[9]}</i></Descriptions.Item>
                      <Descriptions.Item label="HTML" span={3}><div onClick={(e) => copy_data('scopus')} id={'scopus'} style={{userSelect : 'text'}}>{row[10]}</div></Descriptions.Item>
                  </Descriptions>
              }

          </Modal>
      </div>
    );
}

export default App;