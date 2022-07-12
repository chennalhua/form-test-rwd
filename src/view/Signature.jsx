import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { sampleBase64pdf } from '../sampleBase64pdf'
import { Encrypt, Decrypt } from '../assets/javascript/AESTool'
import axios from 'axios'
import AlertMes from './components/AlertMes';
import Loading from './components/Loading';
const Sign = () => {
    //*: 1.取得"舊"表單PDF 
    //*: 2.將"舊"PDF 及簽名圖檔轉 base64 傳回後端 
    //*: 3.取得 "新" PDF 渲染至畫面

    let history = useHistory();
    let location = useLocation();
    console.log(location)
    let [buttonDis, setButtonDis] = useState(true) //按鈕disabled - true:鎖住 false:解鎖
    let [alertMes, setAlertMes] = useState({ mes: '', show: false, color: '' })
    let [isLoading, setIsLoading] = useState(false) // true:開啟 false:關閉
    let [saveImg, setSaveImg] = useState('') // 儲存簽名圖檔
    let [oldPdfData, setOldPdfData] = useState('') // "舊" PDF
    let [newPdfData, setNewPdfData] = useState('') // "新" PDF 傳送至第三步驟進行預覽
    let [propsData, setPropsData] = useState({
        type: '',
        fileType: '',
        formData: { user_code: '', code: '' }
    })

    //AES password
    let key = process.env.REACT_APP_GOLDEN_UAT_Data.substring(0, 32)
    let iv = process.env.REACT_APP_GOLDEN_IV

    const handleAPI = {
        getFormPDFAPI: function () { //取得"舊" PDF
            setIsLoading(true)
            let getOldFormData = {
                user_code: location.state.initialData.formData.user_code,
                fSerial: location.state.initialData.formData.code
            }
            let API = `${process.env.REACT_APP_GOLDEN_MAGENT_API}magent/downloadGoldenForm`
            let data = { // 加密 data
                reqEncData: Encrypt(JSON.stringify(getOldFormData), key, iv),
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
                    setIsLoading(false)
                    setOldPdfData(JSON.parse(Decrypt(res.data.resEncData, key, iv))) //儲存舊 PDF
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        makeNewPDF: function () { //簽名圖檔+"舊" PDF 合檔
            //*取得簽名 dom 元素，並轉換成 base64
            let singElement = document.getElementById('mycanvas')
            let signImage = singElement.toDataURL('image/png');

            //* 判斷身分別
            let getType = location.state.initialData.type //取得由首頁傳送過來的身分別
            let typeCode; //身分別編號
            if (getType == '要保人') {
                typeCode = '1'
            } else if (getType == '被保人') {
                typeCode = '2'
            } else if (getType == '法定代理人') {
                typeCode = '3'
            } else if (getType == '保險費付款授權人') {
                typeCode = '4'
            }

            //! 判斷如果取得 PDF檔 錯誤
            if (oldPdfData.pdfdata == undefined) {
                alertMes({ mes: '取得公勝表單錯誤，請重新操作', show: true, color: 'danger' })
                window.location.reload(); //網頁重整
            }

            //* 傳送過去的 DATA
            let postData = {
                Signatorys: [
                    {
                        Type: typeCode, //身份別
                        PicSign: signImage //簽名檔 base64
                    }
                ],
                FileType: location.state.initialData.fileType, //PDF 檔案別(人身、人身+高保費)
                SignFile: `data:application/pdf;base64,${oldPdfData.pdfdata}` //PDF檔 base64
            }
            console.log(postData)
            let API = `api/signpdf`
            history.push({
                pathname: '/review',
                state: { initialData: location.state.initialData, reviewData: postData, resetSignData: location.state }
            })
            // axios.post(API, postData)
            //     .then((res) => {
            //         let { ResponseCode } = res.data
            //         if (ResponseCode == '0') { //成功

            //         } else if (ResponseCode == '-1') { //系統內部錯誤

            //         } else if (ResponseCode == '-97') { //傳入PDF異常

            //         } else if (ResponseCode == '-98') { //傳入簽名檔異常

            //         } else if (ResponseCode == '-99') { //傳入資料格式錯誤

            //         } else { //其他

            //         }
            //     })
            //     .catch((err) => {
            //         console.log(err)
            //     })
        }
    }
    const handleEvent = {
        signaturePad: function () { //簽名板
            // init canvas element
            let canvas = document.getElementById('mycanvas')
            let ctx = canvas.getContext('2d')

            // 抗鋸齒
            let width = canvas.width,
                height = canvas.height;
            if (window.devicePixelRatio) {
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
                canvas.height = height * window.devicePixelRatio;
                canvas.width = width * window.devicePixelRatio;
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }

            // 取得滑鼠標位置
            function getMousePos(canvas, evt) {
                let rect = canvas.getBoundingClientRect();
                return {
                    x: evt.clientX - rect.left,
                    y: evt.clientY - rect.top
                };
            }

            //滑鼠移動
            function mouseMove(evt) {
                let mousePos = getMousePos(canvas, evt);
                ctx.lineCap = 'round';
                ctx.lineWidth = 4;
                ctx.lineJoin = 'round';
                ctx.shadowBlur = 1; // 邊緣模糊，防止直線邊緣出現鋸齒 
                ctx.shadowColor = 'block';// 邊緣顏色
                ctx.lineTo(mousePos.x, mousePos.y);
                ctx.stroke();
            }

            //滑鼠按下
            canvas.addEventListener('mousedown', function (evt) {
                let mousePos = getMousePos(canvas, evt);
                ctx.beginPath();
                ctx.moveTo(mousePos.x, mousePos.y);
                evt.preventDefault();
                canvas.addEventListener('mousemove', mouseMove, false);
                setButtonDis(false) //確認已經有點下簽名動作，將 button disabled 改為 false
            });

            //滑鼠移開
            canvas.addEventListener('mouseup', function () {
                canvas.removeEventListener('mousemove', mouseMove, false);
            }, false);

            // touch
            function getTouchPos(canvas, evt) {
                let rect = canvas.getBoundingClientRect();
                return {
                    x: evt.touches[0].clientX - rect.left,
                    y: evt.touches[0].clientY - rect.top
                };
            }

            function touchMove(evt) {
                let touchPos = getTouchPos(canvas, evt);
                ctx.lineWidth = 5;
                ctx.lineCap = 'round'; // 繪制圓形的結束線帽
                ctx.lineJoin = 'round'; // 兩條線條交匯時，建立圓形邊角
                ctx.shadowBlur = 1; // 邊緣模糊，防止直線邊緣出現鋸齒 
                ctx.shadowColor = 'black'; // 邊緣顏色
                ctx.lineTo(touchPos.x, touchPos.y);
                ctx.stroke();
            }

            //觸控開始
            canvas.addEventListener('touchstart', function (e) {
                var touchPos = getTouchPos(canvas, e);
                ctx.beginPath(touchPos.x, touchPos.y);
                ctx.moveTo(touchPos.x, touchPos.y);
                e.preventDefault();
                canvas.addEventListener('touchmove', touchMove, false);
                setButtonDis(false) //確認已經有點下簽名動作，將 button disabled 改為 false
            });

            //觸控結束
            canvas.addEventListener('touchend', function () {
                canvas.removeEventListener('touchmove', touchMove, false);
            }, false);

            // clear 清空
            document.getElementById('clear').addEventListener('click', function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setButtonDis(true) //如按下清空按鈕，確認按鈕 disabled
            }, false);

            // convertToImage 轉換成圖片
            // document.getElementById('convertToImage').addEventListener('click', function () {
            // ctx.clearRect(0, 0, canvas.width, canvas.height); //確認後清空
            // }, false);
        }
    }

    useEffect(() => { // 判斷是否有依照正確流程走
        if (location.state == undefined) {
            console.log(location)
            setAlertMes({ mes: '取得表單編號錯誤!!', show: true, color: 'danger' })
            setIsLoading(true)
            setTimeout(() => {
                history.push({ pathname: '/' })
            }, 2000)
            return
        } else {
            setPropsData(location.state.initialData)
            handleAPI.getFormPDFAPI();
        }
    }, [])
    useEffect(() => { }, [propsData])

    useEffect(() => {
        handleEvent.signaturePad();
    }, [])

    useEffect(() => { // alert 打開後再 4.5 秒關閉
        if (alertMes.show) {
            setTimeout(() => {
                setAlertMes({ mes: '', show: false, color: 'transparent' })
            }, 4500)
        }
    }, [alertMes])

    // 儲存成功後，簽名合檔返回成功，即轉頁至預覽
    return (
        <>
            <Loading isLoading={isLoading} />
            <AlertMes mes={alertMes.mes} show={alertMes.show} color={alertMes.color} />
            <div className='container'>
                <div className='d-flex flex-column justify-content-center align-items-center py-4'>
                    <h4 className='text-center fw-bolder'>【{propsData.type}】簽名</h4>
                    <div className='text-end my-3'>
                        <button className='btn btn-outline-primary fw-bolder mx-2' id='clear'>清除並重簽</button>
                        <button className='btn btn-primary fw-bolder text-light' id='convertToImage' disabled={buttonDis && 'disabled'} onClick={handleAPI.makeNewPDF}>儲存簽名</button>
                    </div>
                    <canvas id='mycanvas' width='800' height='350' className='signature'></canvas>
                </div>
                <div id='sign-image' className='d-none'></div>
            </div>
        </>
    )
}
export default Sign