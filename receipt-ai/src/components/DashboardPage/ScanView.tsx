import { useState, useEffect } from 'react';
import {
  SourceSelector,
  CameraCapture,
  ImageUploader,
  ScanningOverlay,
  ProcessingStatus,
  ValidationErrors,
  DataExtractionForm,
} from './ScanViewComponents';
import { scanApi, type ReceiptExtractionData, type Category, type ValidationError } from '../../services/scanApi';
import useToast from '../../hooks/useToast';
import ToastContainer from '../Common/ToastContainer';

/**
 * Scan View Component
 * 
 * AI-powered receipt scanning interface with:
 * - Camera capture with live preview
 * - Image upload (drag-drop or browse)
 * - Tesseract.js OCR (100% free, no API key)
 * - Editable data extraction form
 * - Smart categorization
 */
const ScanView = () => {
  const { toasts, success, error: showError, removeToast } = useToast();
  const [scanSource, setScanSource] = useState<'camera' | 'image'>('image');
  const [scanState, setScanState] = useState<'idle' | 'processing' | 'review' | 'complete'>('idle');
  const [extractedData, setExtractedData] = useState<ReceiptExtractionData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationError[]>([]);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await scanApi.getCategories();
      console.log('📂 Loaded categories from backend:', cats);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    // Create preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    await processReceipt(file);
  };

  const handleCameraCapture = async (file: File) => {
    // Handle cancel (empty file)
    if (file.size === 0) {
      handleRetake();
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    await processReceipt(file);
  };

  const processReceipt = async (file: File) => {
    try {
      setScanState('processing');
      setProcessingStep('Initializing OCR engine...');

      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        setProcessingStep('Analyzing receipt...');
        
        // Use Tesseract.js for client-side OCR
        const data = await scanApi.uploadImage(file);
        
        setProcessingStep('Extracting data...');
        setExtractedData(data);

        // Set warnings from OCR
        if (data.warnings) {
          setValidationWarnings(data.warnings);
        }

        setScanState('review');
      } catch (error: any) {
        console.error('OCR failed:', error);
        showError(`OCR failed: ${error.message}. Try a clearer, well-lit image.`);
        setScanState('idle');
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('Processing failed:', error);
      setScanState('idle');
      setPreviewImage(null);
    }
  };

  const handleDataChange = (changes: Partial<ReceiptExtractionData>) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, ...changes });
    }
  };

  const handleSubmit = async () => {
    if (!extractedData) return;

    // Validate category is selected (REQUIRED)
    if (!extractedData.category || extractedData.category.trim() === '') {
      showError('⚠️ Category is required! Please select a category before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      setProcessingStep('Validating data...');

      // Validate data
      const validation = await scanApi.validateData(extractedData);
      setValidationErrors(validation.errors);
      setValidationWarnings(validation.warnings);

      if (!validation.isValid) {
        showError('Please fix the validation errors before saving');
        setIsSubmitting(false);
        return;
      }

      setProcessingStep('Saving receipt...');
      
      // Prepare data for saving
      const saveData = {
        fileUrl: previewImage || '',
        fileType: scanSource,
        extractedData: {
          merchantName: extractedData.merchant,
          date: extractedData.date,
          amount: extractedData.amount,
        },
        items: extractedData.items || [],
        tax: extractedData.tax || 0,
        category: extractedData.category, // Now required, no fallback
        notes: '',
      };

      console.log('💾 Saving receipt:', saveData);
      
      // Save to database
      const result = await scanApi.saveReceipt(saveData);
      
      console.log('✅ Receipt saved:', result);
      
      // Show success toast
      success(`✅ Receipt from ${extractedData.merchant || 'Unknown'} saved successfully!`);
      
      handleRetake();
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Save failed:', error);
      showError(`❌ Failed to save: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setScanState('idle');
    setExtractedData(null);
    setValidationErrors([]);
    setValidationWarnings([]);
    setProcessingStep('');
    setPreviewImage(null);
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 px-6 pt-6 pb-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-on-surface">Scan Receipt</h1>
          <button className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center hover:bg-secondary-container/80 transition-colors">
            <span className="material-symbols-outlined text-primary">help_outline</span>
          </button>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Source Toggle */}
        <section className="mt-6">
          <SourceSelector source={scanSource} onSourceChange={(source) => {
            setScanSource(source);
            handleRetake(); // Reset state when switching sources
          }} />
        </section>

        {/* Scanner Area - Fixed height container */}
        <section className="relative w-full min-h-[500px] rounded-3xl overflow-hidden bg-surface-container-low shadow-lg border border-outline-variant/20">
          {/* Camera Mode */}
          {scanSource === 'camera' && scanState === 'idle' && (
            <CameraCapture onCapture={handleCameraCapture} />
          )}

          {/* Image Upload Mode */}
          {scanSource === 'image' && scanState === 'idle' && (
            <ImageUploader onUpload={handleImageUpload} />
          )}

          {/* Processing State */}
          {scanState === 'processing' && (
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-surface-container-low">
              <ProcessingStatus step={processingStep} />
            </div>
          )}

          {/* Review State */}
          {scanState === 'review' && previewImage && (
            <div className="absolute inset-0 bg-black">
              <img
                src={previewImage}
                alt="Receipt preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-success">check_circle</span>
                    <div>
                      <p className="text-white font-medium">OCR Complete!</p>
                      <p className="text-white/70 text-sm">Review extracted data below</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Processing Status - Below scanner */}
        {scanState === 'processing' && (
          <section>
            <ProcessingStatus step={processingStep} progress={undefined} />
          </section>
        )}

        {/* Validation Errors & Warnings */}
        {(validationErrors.length > 0 || validationWarnings.length > 0) && (
          <section>
            <ValidationErrors errors={validationErrors} warnings={validationWarnings} />
          </section>
        )}

        {/* Data Extraction Form */}
        {scanState === 'review' && extractedData && (
          <section className="bg-surface-container-low rounded-3xl p-6 shadow-lg border border-outline-variant/20">
            <DataExtractionForm
              extractedData={extractedData}
              categories={categories}
              onChange={handleDataChange}
              onSubmit={handleSubmit}
              onRetake={handleRetake}
              isSubmitting={isSubmitting}
            />
          </section>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ScanView;
