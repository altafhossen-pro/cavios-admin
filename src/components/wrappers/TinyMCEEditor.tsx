import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    tinymce: any
  }
}

interface TinyMCEEditorProps {
  value: string
  onChange: (content: string) => void
  height?: number
  disabled?: boolean
}

const TinyMCEEditor = ({ value, onChange, height = 400, disabled = false }: TinyMCEEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const editorInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Load TinyMCE script if not already loaded
    if (!window.tinymce) {
      const script = document.createElement('script')
      script.src = '/libs/tinymce/tinymce.min.js'
      script.async = true
      script.onload = () => {
        setTimeout(() => initializeEditor(), 100)
      }
      document.head.appendChild(script)
    } else {
      setTimeout(() => initializeEditor(), 100)
    }

    return () => {
      // Cleanup editor on unmount
      if (editorInstanceRef.current && window.tinymce) {
        const editor = window.tinymce.get(editorInstanceRef.current)
        if (editor) {
          editor.remove()
        }
        editorInstanceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeEditor = () => {
    if (!editorRef.current || !window.tinymce) return

    // Check if editor already exists for this element
    if (editorRef.current.id && window.tinymce.get(editorRef.current.id)) {
      return
    }

    // Generate unique ID if not exists
    if (!editorRef.current.id) {
      editorRef.current.id = 'tinymce-' + Math.random().toString(36).substr(2, 9)
    }

    // Initialize TinyMCE
    window.tinymce.init({
      target: editorRef.current,
      height: height,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | link image | code | help',
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
      setup: (editor: any) => {
        editorInstanceRef.current = editor.id
        editor.on('init', () => {
          editor.setContent(value || '')
        })
        editor.on('change keyup', () => {
          const content = editor.getContent()
          onChange(content)
        })
      },
    })
  }

  useEffect(() => {
    if (editorInstanceRef.current && window.tinymce) {
      const editor = window.tinymce.get(editorInstanceRef.current)
      if (editor && editor.getContent() !== value) {
        editor.setContent(value || '')
      }
    }
  }, [value])

  useEffect(() => {
    if (editorInstanceRef.current && window.tinymce) {
      const editor = window.tinymce.get(editorInstanceRef.current)
      if (editor) {
        editor.mode.set(disabled ? 'readonly' : 'design')
      }
    }
  }, [disabled])

  return <textarea ref={editorRef} style={{ visibility: 'hidden' }} />
}

export default TinyMCEEditor

