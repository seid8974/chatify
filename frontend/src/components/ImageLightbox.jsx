import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useState, useEffect } from 'react'

const ImageLightbox = ({ src, onClose }) => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+') setScale(s => Math.min(s + 0.25, 3));
            if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.5));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center'
            onClick={onClose}
        >
            {/* Toolbar */}
            <div className='absolute top-4 right-4 flex gap-3' onClick={e => e.stopPropagation()}>
                <button onClick={() => setScale(s => Math.min(s + 0.25, 3))}
                    className='p-2 bg-slate-800 rounded-lg text-slate-200 hover:bg-slate-700'>
                    <ZoomIn className='w-5 h-5' />
                </button>
                <button onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
                    className='p-2 bg-slate-800 rounded-lg text-slate-200 hover:bg-slate-700'>
                    <ZoomOut className='w-5 h-5' />
                </button>
                <a href={src} download target='_blank' rel='noreferrer'
                    className='p-2 bg-slate-800 rounded-lg text-slate-200 hover:bg-slate-700'>
                    <Download className='w-5 h-5' />
                </a>
                <button onClick={onClose}
                    className='p-2 bg-slate-800 rounded-lg text-slate-200 hover:bg-slate-700'>
                    <X className='w-5 h-5' />
                </button>
            </div>

            {/* Image */}
            <img
                src={src}
                alt='Full size'
                style={{ transform: `scale(${scale})`, transition: 'transform 0.2s' }}
                className='max-w-[90vw] max-h-[90vh] object-contain rounded-lg'
                onClick={e => e.stopPropagation()}
            />
        </div>
    )
}

export default ImageLightbox
