import { Component, OnInit, OnDestroy, forwardRef, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';

// Custom Image Extension with Resize Handles
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes['width']) return {};
          return { width: attributes['width'] };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes['height']) return {};
          return { height: attributes['height'] };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.maxWidth = '100%';
      container.style.margin = '1.5em 0';
      container.className = 'image-container';

      const img = document.createElement('img');
      img.src = node.attrs['src'];
      img.alt = node.attrs['alt'] || '';
      img.style.display = 'block';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.cursor = 'pointer';

      if (node.attrs['width']) {
        img.style.width = node.attrs['width'] + 'px';
      }

      // Resize handles
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 20px;
        height: 20px;
        background: #0066cc;
        border-radius: 4px;
        cursor: nwse-resize;
        display: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      `;

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startWidth = img.offsetWidth;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(100, Math.min(startWidth + diff, container.parentElement!.offsetWidth));
        img.style.width = newWidth + 'px';
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        // Update the node attributes
        const width = img.offsetWidth;
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              width: width,
            })
          );
        }
      };

      resizeHandle.addEventListener('mousedown', onMouseDown);

      // Show/hide resize handle
      container.addEventListener('mouseenter', () => {
        resizeHandle.style.display = 'block';
      });

      container.addEventListener('mouseleave', () => {
        if (!isResizing) {
          resizeHandle.style.display = 'none';
        }
      });

      // Add click to select
      img.addEventListener('click', () => {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.commands.setNodeSelection(pos);
        }
      });

      container.appendChild(img);
      container.appendChild(resizeHandle);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          img.src = updatedNode.attrs['src'];
          if (updatedNode.attrs['width']) {
            img.style.width = updatedNode.attrs['width'] + 'px';
          }
          return true;
        },
        destroy: () => {
          resizeHandle.removeEventListener('mousedown', onMouseDown);
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        },
      };
    };
  },
});

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="editor-container">
      <!-- Toolbar -->
      <div class="editor-toolbar">
        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('bold')"
            (click)="toggleBold()"
            title="Bold (Ctrl+B)">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M170.48,115.7A44,44,0,0,0,144,36H72a8,8,0,0,0-8,8V168a8,8,0,0,0,8,8h80a48,48,0,0,0,18.48-92.3ZM80,52h64a28,28,0,0,1,0,56H80Zm72,108H80V124h72a32,32,0,0,1,0,64Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('italic')"
            (click)="toggleItalic()"
            title="Italic (Ctrl+I)">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M200,56a8,8,0,0,1-8,8H157.77L115.1,192H144a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16H98.23L140.9,64H112a8,8,0,0,1,0-16h80A8,8,0,0,1,200,56Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('underline')"
            (click)="toggleUnderline()"
            title="Underline (Ctrl+U)">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M200,224a8,8,0,0,1-8,8H64a8,8,0,0,1,0-16H192A8,8,0,0,1,200,224ZM128,176a60.07,60.07,0,0,0,60-60V56a8,8,0,0,0-16,0v60a44,44,0,0,1-88,0V56a8,8,0,0,0-16,0v60A60.07,60.07,0,0,0,128,176Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('strike')"
            (click)="toggleStrike()"
            title="Strikethrough">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM72.49,64.62a8,8,0,0,0,3.88,10.61C80.65,76.51,96.45,88,128,88s47.35-11.49,51.63-12.77a8,8,0,1,0-6.73-14.49C172.35,60.51,156.55,72,125,72S77.65,60.51,73.37,59.23A8,8,0,0,0,72.49,64.62ZM189,160H151.79a41,41,0,0,1-7.78,17.54c-9.72,13.84-26.93,22.46-51,22.46s-41.31-8.62-51-22.46A40.89,40.89,0,0,1,32,136a8,8,0,0,1,16,0,24.8,24.8,0,0,0,6.14,16H189a8,8,0,0,1,0,16Z"></path>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('heading', { level: 1 })"
            (click)="toggleHeading(1)"
            title="Heading 1">
            <span class="font-semibold">H1</span>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('heading', { level: 2 })"
            (click)="toggleHeading(2)"
            title="Heading 2">
            <span class="font-semibold">H2</span>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('heading', { level: 3 })"
            (click)="toggleHeading(3)"
            title="Heading 3">
            <span class="font-semibold">H3</span>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('bulletList')"
            (click)="toggleBulletList()"
            title="Bullet List">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM88,72H216a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16ZM216,184H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('orderedList')"
            (click)="toggleOrderedList()"
            title="Numbered List">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM104,72H216a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16ZM216,184H104a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM43.58,55.16,48,52.94V104a8,8,0,0,0,16,0V40a8,8,0,0,0-11.58-7.16l-16,8a8,8,0,0,0,7.16,14.32ZM79.77,156.72a23.73,23.73,0,0,0-9.6-15.95,24.86,24.86,0,0,0-34.11,4.7,8,8,0,1,0,12.94,9.42,8.94,8.94,0,0,1,12.23-1.71,7.79,7.79,0,0,1,3.17,5.27A8.47,8.47,0,0,1,63,166a8,8,0,0,0-4.37,10.33A32.25,32.25,0,0,0,88,200a8,8,0,0,0,0-16A16.23,16.23,0,0,1,73.05,170,24.6,24.6,0,0,0,79.77,156.72Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('blockquote')"
            (click)="toggleBlockquote()"
            title="Blockquote">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H40a16,16,0,0,1-16-16V72A16,16,0,0,1,40,56h60A16,16,0,0,1,116,72ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,216,56Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            [class.active]="editor?.isActive('codeBlock')"
            (click)="toggleCodeBlock()"
            title="Code Block">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"></path>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            (click)="addLink()"
            [class.active]="editor?.isActive('link')"
            title="Insert Link">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            (click)="imageInput.click()"
            title="Insert Image">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM156,88a12,12,0,1,1-12,12A12,12,0,0,1,156,88Zm60,112H40V160.69l46.34-46.35a8,8,0,0,1,11.32,0h0L165,181.66a8,8,0,0,0,11.32-11.32l-17.66-17.65L173,138.34a8,8,0,0,1,11.31,0L216,170.07V200Z"></path>
            </svg>
          </button>
          <input
            #imageInput
            type="file"
            accept="image/*"
            (change)="onImageSelected($event)"
            style="display: none" />

          <button
            type="button"
            class="toolbar-btn"
            (click)="insertHorizontalRule()"
            title="Horizontal Rule">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            (click)="undo()"
            [disabled]="!canUndo()"
            title="Undo (Ctrl+Z)">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"></path>
            </svg>
          </button>

          <button
            type="button"
            class="toolbar-btn"
            (click)="redo()"
            [disabled]="!canRedo()"
            title="Redo (Ctrl+Y)">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h27.41L184.83,71.39l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,1,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Editor Content -->
      <div
        class="editor-content"
        #editorElement
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        [class.drag-over]="isDragging()"></div>

      @if (isDragging()) {
        <div class="drop-overlay">
          <div class="drop-message">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM156,88a12,12,0,1,1-12,12A12,12,0,0,1,156,88Zm60,112H40V160.69l46.34-46.35a8,8,0,0,1,11.32,0h0L165,181.66a8,8,0,0,0,11.32-11.32l-17.66-17.65L173,138.34a8,8,0,0,1,11.31,0L216,170.07V200Z"></path>
            </svg>
            <p>Drop image here</p>
          </div>
        </div>
      }

      <!-- Character Count -->
      <div class="editor-footer">
        <span class="character-count">
          {{ getCharacterCount() }} characters
        </span>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      border: 2px solid #e5e5e5;
      border-radius: 12px;
      overflow: hidden;
      background: white;
      transition: border-color 0.2s;
    }

    .editor-container:focus-within {
      border-color: #0066cc;
    }

    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px;
      background: #f8f9fa;
      border-bottom: 1px solid #e5e5e5;
      flex-wrap: wrap;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: #ddd;
      margin: 0 8px;
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: #666;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toolbar-btn:hover:not(:disabled) {
      background: #e9ecef;
      color: #242424;
    }

    .toolbar-btn.active {
      background: #0066cc;
      color: white;
    }

    .toolbar-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .editor-content {
      min-height: 500px;
      max-height: none;
      overflow-y: visible;
      padding: 24px;
      font-family: 'Newsreader', serif;
      font-size: 18px;
      line-height: 1.75;
      position: relative;
    }

    .editor-content :deep(.ProseMirror) {
      outline: none;
      min-height: 450px;
    }

    .editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
      content: attr(data-placeholder);
      float: left;
      color: #adb5bd;
      pointer-events: none;
      height: 0;
    }

    .editor-content :deep(h1) {
      font-size: 2.25em;
      font-weight: 700;
      line-height: 1.2;
      margin: 1em 0 0.5em;
    }

    .editor-content :deep(h2) {
      font-size: 1.75em;
      font-weight: 700;
      line-height: 1.3;
      margin: 0.9em 0 0.4em;
    }

    .editor-content :deep(h3) {
      font-size: 1.35em;
      font-weight: 600;
      line-height: 1.4;
      margin: 0.8em 0 0.3em;
    }

    .editor-content :deep(p) {
      margin: 0.75em 0;
    }

    .editor-content :deep(strong) {
      font-weight: 700;
    }

    .editor-content :deep(em) {
      font-style: italic;
    }

    .editor-content :deep(u) {
      text-decoration: underline;
    }

    .editor-content :deep(s) {
      text-decoration: line-through;
    }

    .editor-content :deep(a) {
      color: #0066cc;
      text-decoration: underline;
      cursor: pointer;
    }

    .editor-content :deep(blockquote) {
      border-left: 4px solid #e5e5e5;
      padding-left: 1.5em;
      margin: 1.5em 0;
      font-style: italic;
      color: #666;
    }

    .editor-content :deep(ul),
    .editor-content :deep(ol) {
      padding-left: 2em;
      margin: 1em 0;
    }

    .editor-content :deep(li) {
      margin: 0.5em 0;
    }

    .editor-content :deep(code) {
      background: #f1f3f5;
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    .editor-content :deep(pre) {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1.5em;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5em 0;
    }

    .editor-content :deep(pre code) {
      background: none;
      padding: 0;
      color: inherit;
      font-size: 0.95em;
    }

    .editor-content :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5em 0;
      display: block;
      cursor: pointer;
      transition: all 0.2s;
    }

    .editor-content :deep(img:hover) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .editor-content :deep(img.ProseMirror-selectednode) {
      outline: 3px solid #0066cc;
      outline-offset: 2px;
    }

    .editor-content :deep(hr) {
      border: none;
      border-top: 2px solid #e5e5e5;
      margin: 2em 0;
    }

    .editor-content.drag-over {
      background: rgba(0, 102, 204, 0.05);
    }

    .drop-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 102, 204, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 10;
    }

    .drop-message {
      background: white;
      padding: 32px;
      border-radius: 12px;
      border: 2px dashed #0066cc;
      text-align: center;
      color: #0066cc;
    }

    .drop-message svg {
      margin-bottom: 12px;
    }

    .drop-message p {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    .editor-footer {
      padding: 8px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e5e5e5;
      display: flex;
      justify-content: flex-end;
    }

    .character-count {
      font-size: 13px;
      color: #666;
    }
  `]
})
export class RichTextEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editorElement', { static: true }) editorElement!: ElementRef;

  editor: Editor | null = null;
  isDragging = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.editor = new Editor({
      element: this.editorElement.nativeElement,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3]
          }
        }),
        Underline,
        ResizableImage,
        Link.extend({
          inclusive: false
        }).configure({
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer'
          }
        }),
        Placeholder.configure({
          placeholder: 'Tell your story...'
        })
      ],
      editorProps: {
        attributes: {
          class: 'prose prose-lg focus:outline-none'
        }
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.onChange(html);
        this.onTouched();
      }
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    if (this.editor && value !== this.editor.getHTML()) {
      this.editor.commands.setContent(value || '');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.editor?.setEditable(!isDisabled);
  }

  // Formatting methods
  toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  toggleHeading(level: 1 | 2 | 3): void {
    this.editor?.chain().focus().toggleHeading({ level }).run();
  }

  toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  toggleCodeBlock(): void {
    this.editor?.chain().focus().toggleCodeBlock().run();
  }

  addLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  insertHorizontalRule(): void {
    this.editor?.chain().focus().setHorizontalRule().run();
  }

  undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  protected canUndo(): boolean {
    return this.editor?.can().undo() ?? false;
  }

  protected canRedo(): boolean {
    return this.editor?.can().redo() ?? false;
  }

  protected getCharacterCount(): number {
    return this.editor?.state.doc.textContent.length ?? 0;
  }

  // Image handling
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      this.editor?.chain().focus().setImage({ src: url }).run();
    };
    reader.readAsDataURL(file);

    // Reset input
    input.value = '';
  }

  // Drag and drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      this.editor?.chain().focus().setImage({ src: url }).run();
    };
    reader.readAsDataURL(file);
  }
}
