const Loading = (props) => {
    return (
        <>
            <div className={`loading-wrapper position-fixed ${props.isLoading === true ? 'd-block' : 'd-none'}`} style={{ zIndex: '2000', top: '0' }}>
                <div className="loading d-flex flex-column align-items-center">
                    <div className={`spinner-border text-golden-brown spinner-border--width ${props.circleHide ? 'visually-hidden' : ''}`} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    {props.children}
                </div>
            </div>
        </>
    )
}

export default Loading;