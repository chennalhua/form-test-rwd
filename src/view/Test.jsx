import React, { useState } from 'react';
//component
import SignaturePad from './components/SignaturePad';

import PDF from '../assets/document/人身.pdf'
const HomePage = () => {
    //簽名區 value
    let [signTypeTitle, setSignTypeTitle] = useState('') //簽名板 title
    let [signModalShow, setSignModalShow] = useState(false) //簽名板 modal 顯示。true:開啟,false:關閉

    const handleEvent = {
        //簽名板
        showSignaturePad: function (e) {
            e.preventDefault();
            let { dataset, nodeName } = e.target
            if (nodeName !== 'BUTTON') {
                return
            }
            if (!signModalShow) {
                setSignModalShow(!signModalShow)
            }
            setSignTypeTitle(dataset.title)
        },
        closeShowSignaturePad: function () {
            setSignModalShow(false)
        } 
    }

    let signPos = {
        position: 'absolute',
        top: '230px',
        left: '522px'
    }

    return (
        <>
            <div className='container'>
                <button className='btn btn-third fw-bolder mt-3' onClick={handleEvent.showSignaturePad} data-title=''>簽名</button>
                <SignaturePad show={signModalShow} title={signTypeTitle} hide={handleEvent.closeShowSignaturePad} />
                {/* 方法一：
                    1. 將 pdf 轉為 image (遠距公勝表單一份都為 2~3 頁，轉換時間應該不長)
                        ※圖片畫質問題(dpi: 144)
                    2. 將簽名圖嵌入此 image 各固定位置
                    3. 將嵌入完成的簽名圖片，再轉回 PDF
                    4. 回傳【新PDF】至後端
                */}
                {/* 方法二：
                    1. 尋找第三方 plugin 支援
                        - 直接提供 pdf 在線簽名
                        - pdf 轉 canvas 嵌入電子簽名後再轉回 pdf
                */}
                <div className='scroll-container bg-third p-3'>
                    <iframe src={PDF} width='100%' height='768px' className='demo' id='myPdf'></iframe>
                    <div id='sign-image' className='signature-image' style={signPos}></div>
                    <div id='sign-image2' className='signature-image'></div>
                </div>
            </div>
        </>
    )
}
export default HomePage