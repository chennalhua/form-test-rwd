import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
const SignaturePad = (props) => {
    let [saveImg, setSaveImg] = useState(null)
    const handleEvent = {
        signaturePad: function () { //簽名板
            // init canvas element
            let canvas = document.getElementById('mycanvas')
            let ctx = canvas.getContext('2d')

            // 解決鋸齒狀問題
            let width = canvas.width, 
                height = canvas.height;
            if (window.devicePixelRatio) {
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
                canvas.height = height * window.devicePixelRatio;
                canvas.width = width * window.devicePixelRatio;
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            }

            // 取得滑鼠位置
            function getMousePos(canvas, evt) {
                console.log(evt)
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

            function touchMove(e) {
                let touchPos = getTouchPos(canvas, e);
                console.log(touchPos.x, touchPos.y)
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
            });

            //觸控結束
            canvas.addEventListener('touchend', function () {
                canvas.removeEventListener('touchmove', touchMove, false);
            }, false);

            // clear 清空
            document.getElementById('clear').addEventListener('click', function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, false);

            // convertToImage 轉換成圖片
            document.getElementById('convertToImage').addEventListener('click', function () {
                let image = canvas.toDataURL('image/png');
                let htmlImg = `<img src=${image} alt='from canvas' width='60px' height='35px'/>`
                document.getElementById('sign-image').innerHTML = htmlImg
            }, false);
        }
    }
    useEffect(() => {
        if (props.show) {
            handleEvent.signaturePad()
        }
    }, [props]);
    
    return (
        <>
            <Modal show={props.show} size='lg' onHide={props.hide}>
                <Modal.Header closeButton>
                    <Modal.Title>{props.title} 簽名</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <canvas id='mycanvas' width='600' height='250' className='signature'></canvas>
                    <div className='text-end'>
                        <button className='btn btn-secondary' id='convertToImage' onClick={props.hide}>確認</button>
                        <button className='btn btn-secondary mx-2' id='clear'>清除</button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
export default SignaturePad