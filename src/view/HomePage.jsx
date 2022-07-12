import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Modal } from 'react-bootstrap'
import AlertMes from './components/AlertMes'
import Loading from './components/Loading';

import { Encrypt, Decrypt } from '../assets/javascript/AESTool'
import axios from 'axios'
const Page = () => {
    let history = useHistory();

    let [alertMes, setAlertMes] = useState({ mes: '', show: false, color: 'transparent' })
    let [isLoading, setIsLoading] = useState(false)
    let [phoneNum, setPhoneNum] = useState('') //手機號碼
    let [identityType, setIdentityType] = useState('要保人') //身份
    let [inputDis, setInputDis] = useState(false) //表單鎖住：true 開鎖;false 關鎖
    let [modalShow, setModalShow] = useState(false) //MODAL：true:開;false:關
    let [data, setData] = useState([])
    /*--------簡訊驗證---------*/
    let [responseMesData, setResponseMesData] = useState({ Chk1: '123', Chk2: '456' })//接收 response 簡訊確認驗證碼
    let [inputMesChk2, setInputMesChk2] = useState('') //使用者輸入簡訊驗證碼 Chk2

    //抓取網址參數 id
    let id = new URL(window.location.href).searchParams.get('id'); //業務員編號
    let code = new URL(window.location.href).searchParams.get('code'); //公勝表單編號
    useEffect(() => {
        if (code == null || code == undefined || code == '') {
            setAlertMes({ mes: '抓取表單編號錯誤!!請重新連結', show: true, color: 'danger' })
            setInputDis(true)
            setIsLoading(true)
        }
    }, [])

    let key = process.env.REACT_APP_GOLDEN_UAT_Data.substring(0, 32)
    let iv = process.env.REACT_APP_GOLDEN_IV
    const handleAPI = {
        getFormData: function () {
            let postData = {
                user_code: id,
                code: code
            }
            let API = `${process.env.REACT_APP_GOLDEN_MAGENT_API}magent/getLifeForm`
            let data = {
                reqEncData: Encrypt(JSON.stringify(postData), key, iv),
                comp_no: "84200994"
            }
            let postParams = new URLSearchParams();
            postParams.append('reqEncData', data.reqEncData);
            postParams.append('comp_no', data.comp_no);
            axios.post(API, postParams, {
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                }
            })
                .then((res) => {
                    setData(JSON.parse(Decrypt(res.data.resEncData, key, iv)))
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        // ----- OTP ----- //
        sendOTPAPI: function (e) { //發送簡訊 API /SMSEmail
            if (phoneNum == '') {
                setAlertMes({ mes: `尚未正確填寫【${identityType}】手機號碼`, show: true, color: 'danger' })
                setIsLoading(false)
                return
            }
            let API = `${process.env.REACT_APP_API}/SMSEmail`
            let data = {
                Mobile: phoneNum,
                Email: null
            }
            setModalShow(true) //!測試用，需刪除
            // setIsLoading(true)
            // axios.post(API, data)
            //     .then((res) => {
            //         let { ResponseCode } = res.data
            //         if (ResponseCode === '0') {
            //             setIsLoading(false)
            //             setAlertMes({ mes: '驗證碼已發送至您的手機簡訊及Email，請詳加留意', show: true, color: 'secondary' })
            //             setModalShow(true) //打開簡訊 Modal
            //             setResponseMesData({
            //                 Chk1: res.data.Chk1,
            //                 Chk2: res.data.Chk2
            //             })
            //         } else {
            //             /*
            //             -33	發送簡訊dll錯誤,
            //             -34	發送簡訊失敗,
            //             -58	傳入數值不能為空值(簡訊)
            //             */
            //             setAlertMes({ mes: '發送簡訊失敗', show: true, color: 'danger' })
            //             setTimeout(() => {
            //                 setAlertMes({ mes: '已自動幫您重新發送簡訊!!請留意', show: true, color: 'primary' })
            //                 handleEvent.sendMesAPI()
            //             }, 3000)
            //         }
            //     })
            //     .catch((err) => {
            //         setIsLoading(false)
            //         setAlertMes({ mes: '發送簡訊資料失敗!! 請聯繫客服人員', show: true, color: 'danger' })
            //         console.log(err)
            //     })
        },
        OTPVerify: function (e) { //簡訊驗證通過後，直接 POST 註冊 API
            e.preventDefault();
            //空值判斷
            if (inputMesChk2 === '') {
                setAlertMes({ mes: `尚未正確填入驗證碼!!請查看【${identityType}】簡訊`, show: true, color: 'danger' })
                return
            } else if (inputMesChk2 === responseMesData.Chk2) {
                setAlertMes({ mes: '簡訊驗證成功~~ 前往簽名...', show: true, color: 'secondary' })
                setModalShow(false)
                setIsLoading(true)
                // ----- 驗證成功後立即下一步(簽名)  ----- //
                let fileType;
                if (data[0].item27 == '0') { //如果 data item27 等於 0 ，PDF類型為「人身」
                    fileType = '1' //人身
                } else {
                    fileType = '2' //人身+高保費
                }
                setTimeout(() => {
                    history.push({
                        pathname: '/signature',
                        state: { initialData: { type: identityType, fileType: fileType, formData: { user_code: id, code: code } } }
                    })
                }, 3000)
            } else if (inputMesChk2 !== responseMesData.Chk2) {
                setAlertMes({ mes: '簡訊驗證失敗!!請重新確認驗證碼', show: true, color: 'danger' })
                return
            }
        }
    }
    useEffect(() => {
        handleAPI.getFormData()
    }, [])
    useEffect(() => { }, [data])

    const handleEvent = {
        closeModal: function () { //關閉 modal
            setModalShow(false)
        }
    }

    useEffect(() => {
        if (alertMes.mes) {
            setTimeout(() => {
                setAlertMes({ mes: '', show: false, color: 'transparent' })
            }, 4000)
        }
    }, [alertMes]);

    return (
        <>
            <Loading isLoading={isLoading} />
            <AlertMes mes={alertMes.mes} show={alertMes.show} color={alertMes.color} />
            <div className='bg-primary' style={{ minHeight: '100vh' }}>
                <div className='container py-5'>
                    <div className='bg-light py-4 rounded'>
                        <h5 className='fw-bolder text-center mb-3'>mAgent+ 公勝表單 <p className='mt-2'>遠距簽名</p></h5>
                        <div className='col-10 col-md-8 col-lg-6 mx-auto'>
                            {/* 公勝表單 ID */}
                            <div className='form-group'>
                                <input className='form-control' value={`公勝表單編號：${code}`} disabled />
                            </div>
                            {/* 下拉選單 */}
                            <div className='form-group my-4'>
                                <select className='form-select' disabled={inputDis && 'disabled'} onChange={e => setIdentityType(e.target.value)}>
                                    <option value='要保人' selected={identityType == '要保人' && 'selected'}>要保人</option>
                                    <option value='被保人' selected={identityType == '被保人' && 'selected'}>被保人</option>
                                    <option value='法定代理人' selected={identityType == '法定代理人' && 'selected'}>法定代理人</option>
                                    <option value='保險費付款授權人' selected={identityType == '保險費付款授權人' && 'selected'}>保險費付款授權人</option>
                                </select>
                            </div>
                            {/* 手機號碼 */}
                            <div className='form-group'>
                                <input className='form-control' defaultValue='' placeholder='手機號碼'
                                    onChange={e => setPhoneNum(e.target.value)} disabled={inputDis && 'disabled'} />
                            </div>
                            <div className='text-center mt-4'>
                                <button className='btn btn-secondary fw-bolder text-light' onClick={handleAPI.sendOTPAPI} disabled={inputDis && 'disabled'}>簡訊驗證</button>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal show={modalShow} size='md' onHide={handleEvent.closeModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title><span className='fw-bolder'>{identityType}</span>簡訊驗證</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='form-group'>
                            <label>驗證碼</label>
                            <div className='d-flex align-items-center'>
                                <p className='mb-0 me-2 fw-bolder'>{responseMesData.Chk1} -</p>
                                <div>
                                    <input type='tel' id='code' className={`form-control w-100`}
                                        value={inputMesChk2}
                                        onChange={e => setInputMesChk2(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button className='btn btn-secondary text-light fw-bolder' onClick={handleAPI.OTPVerify}>送出</button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    )
}


export default Page;