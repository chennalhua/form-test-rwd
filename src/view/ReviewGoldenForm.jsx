import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import AlertMes from './components/AlertMes';
import Loading from './components/Loading';

const GoldenForm = () => {
    let history = useHistory();
    let location = useLocation();
    let [numPages, setNumPages] = useState(null);
    let [pageNumber, setPageNumber] = useState(1);
    let [isLoading, setIsLoading] = useState(false)
    let [alertMes, setAlertMes] = useState({ mes: '', show: false, color: 'transparent' })
    let [reviewFile, setReviewFile] = useState({ SignFile: '' }) //取得 PDF 文件
    console.log(location)
    useEffect(() => {
        if (location.state == undefined || location.state == null || location.state == '') {
            setIsLoading(true)
            setAlertMes({ mes: '取得檢視 PDF 檔錯誤!!', show: true, color: 'danger' })
            setTimeout(() => {
                history.push({
                    pathname: '/signature',
                    state: location.state
                })
            }, 2000)
            return
        } else {
            setReviewFile(location.state.reviewData)
        }
    }, [location]);
    console.log(location)

    const handleEvent = {
        resetSign: function () { //返回重簽
            history.push({
                pathname: '/signature',
                state: location.state
            })
        },
        checkUpload: function () {
            console.log('確認上傳')
        }
    }

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
    }
    function changePage(offSet) { setPageNumber(prevPageNumber => prevPageNumber + offSet); }
    function changePageBack() { changePage(-1) }
    function changePageNext() { changePage(+1) }

    //base64 轉 file
    function dataURLtoFile(dataUrl, filename) {
        let arr = dataUrl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    useEffect(() => {
        if (alertMes.show) {
            setTimeout(() => {
                setAlertMes({ mes: '', show: false, color: 'transparent' })
            }, 4500)
        }
    }, [alertMes])

    return (
        <>
            <Loading isLoading={isLoading} />
            <AlertMes mes={alertMes.mes} show={alertMes.shoe} color={alertMes.color} />
            {/* <div className='container'>
                <h4 className='text-center fw-bolder mt-4'>檢視(簽名)</h4>
                <div className='text-center py-3'>
                    <button className='btn btn-third fw-bolder me-3' onClick={handleEvent.resetSign}>取消，重簽</button>
                    <button className='btn btn-secondary fw-bolder text-light' onClick={handleEvent.checkUpload}>確認，上傳</button>
                </div>
                <div className='iframe-container mb-3'>
                    <iframe src={reviewFile.SignFile} className='iframe-responsive'></iframe>
                </div>
                <img src={location.state.reviewData.Signatorys[0].PicSign} className='img-fluid'/>
            </div> */}
            <center>
                <div className='bg-third' style={{ overflowY: 'scroll', height: '450px' }}>
                    <Document file={reviewFile.SignFile} onLoadSuccess={onDocumentLoadSuccess}>
                        {Array.from(
                            new Array(numPages),
                            (el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    height='1100'
                                    pageNumber={index + 1}
                                    className='pt-3 img-fluid'
                                    style={{fontSize:'16px'}}
                                >
                                </Page>
                            )
                        )}
                    </Document>
                </div>
                <div className='text-center py-3'>
                    <button className='btn btn-third fw-bolder me-3'>取消，重簽</button>
                    <button className='btn btn-secondary fw-bolder text-light'>確認，上傳</button>
                </div>
            </center>
        </>


    );
}

export default GoldenForm;
