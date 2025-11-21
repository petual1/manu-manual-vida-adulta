
import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { toast } from 'sonner';


const DraggablePoint = React.forwardRef(({ style, ...props }, ref) => (
  <div ref={ref} style={style} {...props}>
    <div style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: 'var(--primary-color, #007bff)',
        border: '2px solid white',
        transform: 'translate(-50%, -50%)',
        cursor: 'move',
        boxShadow: '0 0 5px rgba(0,0,0,0.5)',
        pointerEvents: 'auto'
    }} />
  </div>
));


export default function DocumentScanner({ imageFile, onConfirm, onCancel }) {
    
    const [points, setPoints] = useState([]); 
    const [layout, setLayout] = useState({
        imgRect: { width: 0, height: 0, top: 0, left: 0 },
        containerRect: { width: 0, height: 0, top: 0, left: 0 },
        scaleDown: { x: 1, y: 1 },
        scaleUp: { x: 1, y: 1 }
    });
    
    const [imgUrl, setImgUrl] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [isOpenCVReady, setIsOpenCVReady] = useState(false);
    const [isDetecting, setIsDetecting] = useState(true);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const imgRef = useRef(null);
    const containerRef = useRef(null);
    const naturalCanvasRef = useRef(null); 
    const previewCanvasRef = useRef(null); 
    
    const pointRefs = useRef([
      React.createRef(), React.createRef(),
      React.createRef(), React.createRef()
    ]);

    useEffect(() => {
        const checkOpenCV = setInterval(() => {
            if (window.cv && window.cv.imread) {
                setIsOpenCVReady(true);
                clearInterval(checkOpenCV);
            }
        }, 100);
        return () => clearInterval(checkOpenCV);
    }, []);

    useEffect(() => {
        if (!imageFile || !isOpenCVReady) return;

        setIsImageLoaded(false);
        setIsDetecting(true);
        setScanResult(null);
        setPoints([]);
        setLayout({
            imgRect: { width: 0, height: 0, top: 0, left: 0 },
            containerRect: { width: 0, height: 0, top: 0, left: 0 },
            scaleDown: { x: 1, y: 1 },
            scaleUp: { x: 1, y: 1 }
        });

        const objectUrl = URL.createObjectURL(imageFile);
        setImgUrl(objectUrl);

        const img = new Image();
        img.onload = () => {
            const canvas = naturalCanvasRef.current;
            if (canvas) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                const ctx = canvas.getContext('2d', { willReadFrequently: true }); 
                
                ctx.drawImage(img, 0, 0);
                setIsImageLoaded(true);
                toast.success("Imagem carregada no canvas.");
            }
        };
        img.src = objectUrl;

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile, isOpenCVReady]);

    useEffect(() => {
        const imgElement = imgRef.current;
        const containerElement = containerRef.current;
        if (!imgElement || !containerElement) return;

        const observer = new ResizeObserver(() => {
            const img = imgRef.current;
            const canvas = naturalCanvasRef.current;
            const container = containerRef.current;
            
            if (!img || !canvas || !container || canvas.width === 0 || img.clientHeight === 0) return;

            const imgRect = img.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const scaleDown = {
                x: imgRect.width / canvas.width,
                y: imgRect.height / canvas.height
            };
            
            const scaleUp = {
                x: canvas.width / imgRect.width,
                y: canvas.height / imgRect.height
            };
            
            setLayout({ imgRect, containerRect, scaleDown, scaleUp });
        });

        observer.observe(imgElement);
        observer.observe(containerElement);

        return () => observer.disconnect();
        
    }, [imgUrl]);
    

    useEffect(() => {
        if (!isImageLoaded || !isOpenCVReady || !isDetecting || layout.imgRect.width === 0) {
            return;
        }

        const cv = window.cv;
        const sourceCanvas = naturalCanvasRef.current;
        const naturalWidth = sourceCanvas.width;
        const naturalHeight = sourceCanvas.height;
        
        let src;
        try {
            src = cv.imread(sourceCanvas); 
            let dst = new cv.Mat();
            let M = new cv.Mat();
            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            let bestApprox = new cv.Mat();

            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
            cv.GaussianBlur(dst, dst, new cv.Size(5, 5), 0);
            cv.Canny(dst, dst, 75, 200);
            M = cv.Mat.ones(3, 3, cv.CV_8U);
            cv.dilate(dst, dst, M);
            cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            let maxArea = 0;
            for (let i = 0; i < contours.size(); ++i) {
                let cnt = contours.get(i);
                let area = cv.contourArea(cnt);
                if (area > (naturalWidth * naturalHeight / 10)) { 
                    let peri = cv.arcLength(cnt, true);
                    let approx = new cv.Mat();
                    cv.approxPolyDP(cnt, approx, 0.02 * peri, true);
                    if (approx.rows === 4 && area > maxArea) {
                        maxArea = area;
                        bestApprox.delete(); 
                        bestApprox = approx.clone(); 
                    }
                    approx.delete();
                }
                cnt.delete();
            }

            let finalPoints = [];
            if (maxArea > 0) {
                const data = bestApprox.data32S;
                const pts = [
                    { x: data[0], y: data[1] },
                    { x: data[2], y: data[3] },
                    { x: data[4], y: data[5] },
                    { x: data[6], y: data[7] }
                ];
                finalPoints = sortPoints(pts); 
            } else {
                toast.info("Detecção automática falhou. Ajuste manualmente.");
                const mX = naturalWidth * 0.1;
                const mY = naturalHeight * 0.1;
                finalPoints = [
                    { x: mX, y: mY },
                    { x: naturalWidth - mX, y: mY },
                    { x: naturalWidth - mX, y: naturalHeight - mY },
                    { x: mX, y: naturalHeight - mY }
                ];
            }

            setPoints(finalPoints);
            
            src.delete(); dst.delete(); M.delete(); contours.delete(); hierarchy.delete(); bestApprox.delete();
            setIsDetecting(false);

        } catch (err) {
            console.error(err);
            toast.error("Erro ao detectar bordas.");
            if (src) src.delete();
            setIsDetecting(false);
        }
    }, [isOpenCVReady, isDetecting, layout, isImageLoaded]);

    const sortPoints = (pts) => {
        pts.sort((a, b) => a.y - b.y);
        const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
        const bottom = pts.slice(2, 4).sort((a, b) => b.x - a.x);
        return [top[0], top[1], bottom[0], bottom[1]];
    };

    const applyCrop = () => {
        if (!window.cv || !naturalCanvasRef.current || points.length !== 4) {
            toast.error("Faltam dados para o recorte.");
            return;
        }
        
        const cv = window.cv;
        const sourceCanvas = naturalCanvasRef.current;
        const srcPoints = points;
        
        let src = cv.imread(sourceCanvas); 
        let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            srcPoints[0].x, srcPoints[0].y,
            srcPoints[1].x, srcPoints[1].y,
            srcPoints[2].x, srcPoints[2].y,
            srcPoints[3].x, srcPoints[3].y
        ]);

        const w1 = Math.hypot(srcPoints[1].x - srcPoints[0].x, srcPoints[1].y - srcPoints[0].y);
        const w2 = Math.hypot(srcPoints[2].x - srcPoints[3].x, srcPoints[2].y - srcPoints[3].y);
        const maxWidth = Math.max(w1, w2);
        const h1 = Math.hypot(srcPoints[3].x - srcPoints[0].x, srcPoints[3].y - srcPoints[0].y);
        const h2 = Math.hypot(srcPoints[2].x - srcPoints[1].x, srcPoints[2].y - srcPoints[1].y);
        const maxHeight = Math.max(h1, h2);

        const LIMIT = 1800;
        let finalW = maxWidth;
        let finalH = maxHeight;
        if (maxWidth > LIMIT || maxHeight > LIMIT) {
            const ratio = Math.min(LIMIT / maxWidth, LIMIT / maxHeight);
            finalW = maxWidth * ratio;
            finalH = maxHeight * ratio;
        }

        let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, finalW, 0, finalW, finalH, 0, finalH]);
        let M = cv.getPerspectiveTransform(srcTri, dstTri);
        let dsize = new cv.Size(finalW, finalH);
        let dst = new cv.Mat();
        
        cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255));
        
        cv.imshow(previewCanvasRef.current, dst);
        
        src.delete(); dst.delete(); M.delete(); srcTri.delete(); dstTri.delete();

        previewCanvasRef.current.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            setScanResult({ url, blob });
        }, 'image/jpeg', 0.92);
    };

    const handleDrag = (index, e, data) => {
        const { scaleUp } = layout;
        if (scaleUp.x === 0 || scaleUp.y === 0) return;

        const naturalX = data.x * scaleUp.x;
        const naturalY = data.y * scaleUp.y;

        const newPoints = [...points];
        newPoints[index] = { x: naturalX, y: naturalY };
        setPoints(newPoints);
    };

    const confirmFinal = () => {
        if (scanResult?.blob) {
            const file = new File([scanResult.blob], `scanned_${Date.now()}.jpg`, { type: "image/jpeg" });
            onConfirm(file);
        }
    };
    
    
    const overlayStyle = {
        position: 'absolute',
        left: `${layout.imgRect.left - layout.containerRect.left}px`,
        top: `${layout.imgRect.top - layout.containerRect.top}px`,
        width: `${layout.imgRect.width}px`,
        height: `${layout.imgRect.height}px`,
        pointerEvents: 'none',
        zIndex: 5,
    };
    
    const svgPoints = points.length === 4 ? points.map(p => 
        `${p.x * layout.scaleDown.x},${p.y * layout.scaleDown.y}`
    ).join(' ') : "";


    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column'
        }}>
            {}
            {scanResult ? (
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20}}>
                    <h3 style={{color: 'white', marginBottom: 10}}>Resultado</h3>
                    <img 
                        src={scanResult.url} 
                        style={{maxWidth: '100%', maxHeight: '70vh', border: '1px solid #444'}} 
                        alt="Resultado" 
                    />
                    <div style={{marginTop: 20, display: 'flex', gap: 15}}>
                        <button onClick={() => setScanResult(null)} className="nav-button secondary">
                            <i className="fas fa-undo"></i> Refazer Ajuste
                        </button>
                        <button onClick={confirmFinal} className="nav-button success large">
                            <i className="fas fa-check"></i> Salvar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{padding: '15px', textAlign: 'center', color: 'white', background: 'rgba(0,0,0,0.5)'}}>
                        <h3 style={{margin: 0, fontSize: '1.1rem'}}>Ajuste os cantos</h3>
                        <p style={{margin: '5px 0 0 0', fontSize: '0.85rem', opacity: 0.8}}>Arraste as bolinhas para os cantos do documento</p>
                    </div>

                    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                        
                        {imgUrl && (
                            <img 
                                ref={imgRef} 
                                src={imgUrl} 
                                style={{ maxWidth: '95%', maxHeight: '80vh', display: 'block' }} 
                                alt="Original" 
                            />
                        )}
                        
                        {}
                        {layout.imgRect.width > 0 && !isDetecting && points.length === 4 && (
                            <div className="overlay-wrapper" style={overlayStyle}>

                                {}
                                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                    <polygon 
                                        points={svgPoints}
                                        fill="rgba(0, 123, 255, 0.2)"
                                        stroke="#007bff"
                                        strokeWidth="2"
                                    />
                                </svg>

                                {}
                                {points.map((p, i) => {
                                    const nodeRef = pointRefs.current[i];
                                    const displayPoint = {
                                        x: p.x * layout.scaleDown.x,
                                        y: p.y * layout.scaleDown.y
                                    };
                                    
                                    return (
                                        <Draggable 
                                            key={i}
                                            nodeRef={nodeRef}
                                            position={displayPoint}
                                            onDrag={(e, d) => handleDrag(i, e, d)} 
                                            bounds="parent"
                                        >
                                            <DraggablePoint 
                                                ref={nodeRef}
                                                style={{ position: 'absolute', pointerEvents: 'auto', zIndex: 10 }}
                                            />
                                        </Draggable>
                                    );
                                })}
                            </div>
                        )}
                        
                        {isDetecting && (
                            <div style={{position:'absolute', color: 'white'}}>
                                <p>Detectando...</p>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: 20, display: 'flex', gap: 15, justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
                        <button onClick={onCancel} className="nav-button secondary">Cancelar</button>
                        <button onClick={applyCrop} className="nav-button primary large" disabled={isDetecting || points.length !== 4}>
                            Recortar <i className="fas fa-crop-alt" style={{marginLeft: 8}}></i>
                        </button>
                    </div>
                </>
            )}
            
            {}
            
            {}
            {}
            <canvas ref={naturalCanvasRef} style={{ display: 'none' }}></canvas>
            
            <canvas ref={previewCanvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
}