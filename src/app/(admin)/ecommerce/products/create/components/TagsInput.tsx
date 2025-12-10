import { useState, KeyboardEvent } from 'react'
import { Form, Badge, Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

interface TagsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

const TagsInput = ({ tags, onChange, placeholder = 'Type and press Enter to add tags' }: TagsInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag])
        setInputValue('')
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div>
      <Form.Control
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {tags.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} bg="primary" className="d-flex align-items-center gap-1">
              {tag}
              <Button
                variant="link"
                className="p-0 text-white"
                style={{ fontSize: '0.75rem', lineHeight: 1 }}
                onClick={() => removeTag(tag)}
              >
                <IconifyIcon icon="bx:x" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagsInput

