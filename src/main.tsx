import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ThrottleDebounceDemo from "./features/throthle-debounce/index.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {TabsValue} from "@/constants/tabs.ts";
import DeepCloneComparison from "@/features/deep-clone-comparison";




createRoot(document.getElementById('root')!).render(
  <StrictMode>
          <Tabs className="flex w-full pt-8 items-center flex-col" defaultValue={TabsValue.ThrottleDebounceDemo}>
              <TabsList>
                  <TabsTrigger value={TabsValue.ThrottleDebounceDemo}>Throttle Debounce Demo</TabsTrigger>
                  <TabsTrigger value={TabsValue.DeepCloneComparisonDemo}>Deep Clone Comparison Demo</TabsTrigger>
              </TabsList>
              <TabsContent value={TabsValue.ThrottleDebounceDemo}>
                  <ThrottleDebounceDemo />
              </TabsContent>
              <TabsContent value={TabsValue.DeepCloneComparisonDemo}>
                  <DeepCloneComparison />
              </TabsContent>
          </Tabs>
  </StrictMode>,
)
