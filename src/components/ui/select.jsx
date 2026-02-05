"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const selectRef = React.useRef(null)

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span className="block truncate">
          {selectedValue ? (
            <div className="flex items-center gap-2">
              {(() => {
                const selectedChild = children.find(child => child.props?.value === selectedValue);
                if (selectedChild && selectedChild.props?.children) {
                  const childContent = selectedChild.props.children;
                  if (childContent.props && childContent.props.children) {
                    return (
                      <>
                        <span className="text-lg">{childContent.props.children[0]}</span>
                        <span>{childContent.props.children[1]}</span>
                      </>
                    );
                  }
                }
                return selectedValue;
              })()}
            </div>
          ) : (
            "აირჩიეთ იკონი"
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 dark:ring-white/10">
          <div className="max-h-60 overflow-auto rounded-lg py-1">
            {React.Children.map(children, (child) => {
              if (child && child.props) {
                return React.cloneElement(child, {
                  onClick: () => handleSelect(child.props.value),
                  className: cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:focus:bg-gray-700 dark:focus:text-gray-100",
                    selectedValue === child.props.value && "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-200"
                  )
                })
              }
              return child
            })}
          </div>
        </div>
      )}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => (
  <span ref={ref} className={cn("block truncate", className)} {...props}>
    {placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-1", className)} {...props}>
    {children}
  </div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
